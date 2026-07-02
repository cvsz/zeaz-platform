from fastapi import FastAPI, WebSocket
import os
import asyncio
from deepgram import DeepgramClient, LiveTranscriptionEvents, LiveOptions
import openai

app = FastAPI()

DEEPGRAM_API_KEY = os.getenv('DEEPGRAM_API_KEY', 'dummy-key')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', 'dummy-key')

openai.api_key = OPENAI_API_KEY
client = openai.OpenAI(api_key=OPENAI_API_KEY)

SYSTEM_PROMPT = """
## Objective
You are a voice AI agent engaging in a human-like voice conversation with the user on the Zaiz platform.
You will respond based on your given instruction and the provided transcript.
Keep responses concise, conversational, and avoid repeating the user's transcript.
"""

@app.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    deepgram = DeepgramClient(DEEPGRAM_API_KEY)
    dg_connection = deepgram.listen.live.v("1")
    
    conversation_memory = [{"role": "system", "content": SYSTEM_PROMPT}]
    is_finals = []
    
    def on_message(self, result, **kwargs):
        nonlocal is_finals
        sentence = result.channel.alternatives[0].transcript
        if not sentence: return
        
        if result.is_final:
            is_finals.append(sentence)
            if result.speech_final:
                utterance = " ".join(is_finals)
                is_finals = []
                
                # Update memory
                conversation_memory.append({"role": "user", "content": utterance})
                
                # Get OpenAI response
                chat_completion = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=conversation_memory
                )
                
                response_text = chat_completion.choices[0].message.content.strip()
                conversation_memory.append({"role": "assistant", "content": response_text})
                
                # Push back text (frontend will handle TTS or we can send Deepgram TTS stream)
                asyncio.run(websocket.send_json({"text": response_text, "type": "response"}))

    dg_connection.on(LiveTranscriptionEvents.Transcript, on_message)
    
    options = LiveOptions(
        model="nova-2",
        language="en-US",
        smart_format=True,
        encoding="linear16",
        channels=1,
        sample_rate=16000,
        interim_results=True,
        vad_events=True,
        endpointing=500,
    )
    
    if not dg_connection.start(options):
        await websocket.close()
        return

    try:
        while True:
            data = await websocket.receive_bytes()
            # Feed browser audio data to Deepgram
            dg_connection.send(data)
    except Exception as e:
        print(f"WebSocket closed: {e}")
    finally:
        dg_connection.finish()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
