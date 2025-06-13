"""
Run Script for Logistics Application

This script starts both the backend and frontend servers.
"""

import os
import subprocess
import sys
import time
import webbrowser
import signal
import platform

# Global variables for process management
backend_process = None
frontend_process = None

def is_windows():
    return platform.system() == "Windows"

def start_backend():
    """Start the FastAPI backend server."""
    print("Starting backend server...")
    cmd = ["python", "backend/run.py"]
    if is_windows():
        backend_process = subprocess.Popen(cmd, creationflags=subprocess.CREATE_NEW_CONSOLE)
    else:
        backend_process = subprocess.Popen(cmd)
    return backend_process

def start_frontend():
    """Start the frontend development server."""
    print("Starting frontend server...")
    os.chdir("frontend")
    cmd = ["npm", "run", "dev"]
    if is_windows():
        frontend_process = subprocess.Popen(cmd, creationflags=subprocess.CREATE_NEW_CONSOLE)
    else:
        frontend_process = subprocess.Popen(cmd)
    os.chdir("..")
    return frontend_process

def cleanup(signum=None, frame=None):
    """Clean up processes on exit."""
    print("\nShutting down servers...")
    
    if backend_process:
        print("Terminating backend server...")
        if is_windows():
            backend_process.kill()
        else:
            backend_process.terminate()
    
    if frontend_process:
        print("Terminating frontend server...")
        if is_windows():
            frontend_process.kill()
        else:
            frontend_process.terminate()
    
    print("Shutdown complete.")
    sys.exit(0)

def main():
    """Main function to run the application."""
    # Register signal handlers for graceful shutdown
    signal.signal(signal.SIGINT, cleanup)
    signal.signal(signal.SIGTERM, cleanup)
    
    try:
        # Start servers
        global backend_process, frontend_process
        backend_process = start_backend()
        time.sleep(2)  # Wait for backend to start
        frontend_process = start_frontend()
        
        # Open browser
        time.sleep(3)  # Wait for frontend to start
        webbrowser.open("http://localhost:5173")
        
        print("\nServers are running!")
        print("- Backend: http://localhost:8000")
        print("- Frontend: http://localhost:5173")
        print("- API Documentation: http://localhost:8000/docs")
        print("\nPress Ctrl+C to stop the servers.")
        
        # Keep the script running
        while True:
            time.sleep(1)
    
    except KeyboardInterrupt:
        cleanup()
    except Exception as e:
        print(f"Error: {e}")
        cleanup()

if __name__ == "__main__":
    main() 