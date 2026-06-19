from datetime import datetime, timezone


class WarRoomService:
    def __init__(self, organization_id: str, workspace_id: str):
        self.organization_id = organization_id
        self.workspace_id = workspace_id
        self.sessions: dict[str, dict] = {}

    def create_session(self, session_id: str, title: str, context: dict | None = None) -> dict:
        session = {
            "session_id": session_id,
            "title": title,
            "context": context or {},
            "status": "active",
            "messages": [],
            "decisions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        self.sessions[session_id] = session
        return session

    def post_message(self, session_id: str, author: str, content: str, message_type: str = "general") -> dict | None:
        session = self.sessions.get(session_id)
        if session is None:
            return None
        message = {
            "message_id": f"msg-{len(session['messages']) + 1}",
            "author": author,
            "content": content,
            "message_type": message_type,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        session["messages"].append(message)
        return message

    def record_decision(self, session_id: str, decision: str, rationale: str) -> dict | None:
        session = self.sessions.get(session_id)
        if session is None:
            return None
        entry = {
            "decision_id": f"dec-{len(session['decisions']) + 1}",
            "decision": decision,
            "rationale": rationale,
            "recorded_at": datetime.now(timezone.utc).isoformat(),
        }
        session["decisions"].append(entry)
        return entry

    def close_session(self, session_id: str, summary: str | None = None) -> dict | None:
        session = self.sessions.get(session_id)
        if session is None:
            return None
        session["status"] = "closed"
        session["summary"] = summary or ""
        session["closed_at"] = datetime.now(timezone.utc).isoformat()
        return session

    def get_transcript(self, session_id: str) -> dict | None:
        session = self.sessions.get(session_id)
        if session is None:
            return None
        return {
            "session_id": session_id,
            "title": session["title"],
            "status": session["status"],
            "message_count": len(session["messages"]),
            "decision_count": len(session["decisions"]),
            "messages": session["messages"],
            "decisions": session["decisions"],
        }
