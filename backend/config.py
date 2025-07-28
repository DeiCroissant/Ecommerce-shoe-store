import os
from datetime import timedelta

class Config:
    """Cấu hình cơ bản cho Flask app"""
    
    # Flask config
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'SECRET_KEY'
    DEBUG = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    
    # MongoDB config
    MONGO_URI = os.environ.get('MONGO_URI') or 'mongodb+srv://username:password@cluster.mongodb.net/Shoe-store?retryWrites=true&w=majority'
    
    # JWT config
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'SECRET_KEY'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=1)
    
    # CORS config
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '*').split(',')
    
    # Server config
    HOST = os.environ.get('HOST', '0.0.0.0')
    PORT = int(os.environ.get('PORT', 3000))

class DevelopmentConfig(Config):
    """Cấu hình cho môi trường development"""
    DEBUG = True

class ProductionConfig(Config):
    """Cấu hình cho môi trường production"""
    DEBUG = False
    # Thêm các cấu hình bảo mật cho production
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-secret-key-here'

# Dictionary để map environment với config class
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
} 