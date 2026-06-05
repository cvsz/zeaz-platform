import hashlib
import hmac


def verify(secret:str,payload:bytes,signature:str)->bool:
 digest=hmac.new(secret.encode(),payload,hashlib.sha256).hexdigest()
 return hmac.compare_digest(digest,signature)


def process(event:dict)->dict:
 return {
 'event':event.get('type'),
 'status':'processed'
 }
