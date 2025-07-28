#!/usr/bin/env python3
"""
Script để chạy Flask backend
"""

import os
import sys
from app import app

def main():
    """Chạy Flask app"""
    
    # Set environment variables
    if not os.environ.get('FLASK_ENV'):
        os.environ['FLASK_ENV'] = 'development'
    
    # Get port from environment or use default
    port = int(os.environ.get('PORT', 3000))
    host = os.environ.get('HOST', '0.0.0.0')
    
    print(f"Starting Flask backend on {host}:{port}")
    print(f"Environment: {os.environ.get('FLASK_ENV', 'development')}")
    
    try:
        app.run(
            host=host,
            port=port,
            debug=app.config.get('DEBUG', True)
        )
    except KeyboardInterrupt:
        print("\nShutting down Flask backend...")
        sys.exit(0)
    except Exception as e:
        print(f"Error starting Flask app: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main() 