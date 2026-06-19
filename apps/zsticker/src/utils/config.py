import os
import sys
from pydantic import Field, field_validator, model_validator, ValidationError
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    sheet_id: str = Field(..., validation_alias='SHEET_ID')
    line_token: str = Field(..., validation_alias='LINE_CHANNEL_ACCESS_TOKEN')
    line_group_id: str = Field(..., validation_alias='LINE_GROUP_ID')
    imgur_client_id: str = Field(..., validation_alias='IMGUR_CLIENT_ID')
    credentials_path: str = Field('credentials.json', validation_alias='CREDENTIALS_PATH')
    env: str = Field('production', validation_alias='ENV')
    admin_line_group_id: str = Field('', validation_alias='ADMIN_LINE_GROUP_ID')
    dashboard_password: str = Field('admin123', validation_alias='DASHBOARD_PASSWORD')

    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8', extra='ignore')

    @field_validator('line_token')
    @classmethod
    def validate_line_token(cls, v):
        if not v or len(v) < 20:
            raise ValueError("รูปแบบ LINE Token ไม่ถูกต้อง (สั้นเกินไป)")
        return v
        
    @model_validator(mode='after')
    def validate_google_credentials(self):
        cred_path = self.credentials_path
        has_adc = 'GOOGLE_APPLICATION_CREDENTIALS' in os.environ
        default_adc = os.path.expanduser('~/.config/gcloud/application_default_credentials.json')
        
        if not os.path.exists(cred_path) and not has_adc and not os.path.exists(default_adc):
            raise ValueError(f"ไม่พบไฟล์ {cred_path} และไม่มี Application Default Credentials (ADC)")
        return self

def Config() -> Settings:
    try:
        settings = Settings()
        
        masked_token = f"{settings.line_token[:5]}...{settings.line_token[-5:]}" if len(settings.line_token) > 10 else "***"
        masked_imgur = f"{settings.imgur_client_id[:3]}...{settings.imgur_client_id[-3:]}" if len(settings.imgur_client_id) > 6 else "***"
        
        print("\n=== ⚙️  โหลด Config สำเร็จ ===")
        print(f"SHEET_ID:         {settings.sheet_id}")
        print(f"LINE_GROUP_ID:    {settings.line_group_id}")
        print(f"LINE_TOKEN:       {masked_token}")
        print(f"IMGUR_CLIENT_ID:  {masked_imgur}")
        print(f"CREDENTIALS:      {settings.credentials_path}")
        print("===============================\n")
        
        return settings
    except ValidationError as e:
        print("\n❌ เกิดข้อผิดพลาดในการโหลด Config:")
        for err in e.errors():
            field = err.get('loc', [''])[0]
            if field == 'line_token':
                field = 'LINE_CHANNEL_ACCESS_TOKEN'
            elif field == 'sheet_id':
                field = 'SHEET_ID'
            elif field == 'line_group_id':
                field = 'LINE_GROUP_ID'
            elif field == 'imgur_client_id':
                field = 'IMGUR_CLIENT_ID'
            
            msg = err['msg']
            print(f" - ตัวแปร {field}: {msg}")
            
        print("\n💡 กรุณาตรวจสอบไฟล์ .env หรือ Environment Variables ให้ครบถ้วน")
        sys.exit(1)
