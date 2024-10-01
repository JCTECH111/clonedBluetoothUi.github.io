import platform
import subprocess
import json
from flask_cors import CORS
from flask import Flask, jsonify, request

# Initialize Flask app
app = Flask(__name__)
CORS(app)

@app.route('/discover_devices', methods=['GET'])
def discover_devices():
    """Discover Bluetooth devices based on the operating system."""
    os_type = detect_os()

    try:
        if os_type == 'Windows':
            devices = discover_windows_devices()
        elif os_type == 'Linux':
            devices = discover_linux_devices()
        elif os_type == 'Android':
            devices = discover_android_devices()
        else:
            return jsonify({"error": "Unsupported OS"}), 500

        return jsonify(devices)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def detect_os():
    """ Detect the current OS platform """
    os_type = platform.system()
    # Detect Android based on platform string
    if "android" in platform.platform().lower():
        return "Android"
    return os_type

### OS-specific Bluetooth discovery functions ###

def discover_windows_devices():
    """Discover Bluetooth devices on Windows using PowerShell."""
    result = subprocess.check_output(
        ["powershell", "-Command", "Get-PnpDevice -Class Bluetooth"],
        universal_newlines=True
    )
    return parse_bluetooth_devices(result)

def discover_linux_devices():
    """Discover Bluetooth devices on Linux using pybluez."""
    import bluetooth
    devices = bluetooth.discover_devices(lookup_names=True)
    return [{"name": name, "address": addr} for addr, name in devices]

def discover_android_devices():
    """Placeholder for Android Bluetooth discovery."""
    return {"message": "For Android, use the Web Bluetooth API for discovery"}

### Utility function to parse Bluetooth devices ###

def parse_bluetooth_devices(device_list):
    """Parse the Bluetooth devices listed from Windows PowerShell."""
    devices = []
    for line in device_list.splitlines():
        if "Bluetooth" in line:
            parts = line.split()
            if len(parts) > 4:
                device_name = ' '.join(parts[4:])
                device_address = parts[3]  # Adjust based on output format
                devices.append({"name": device_name, "address": device_address})
    return devices

### Bluetooth Device Connection Endpoints ###

@app.route('/connect_device', methods=['POST'])
def connect_device():
    """Connect to a Bluetooth device based on the OS."""
    os_type = detect_os()
    data = request.json
    device_address = "80:79:5D:30:FA:C6"

    if not device_address:
        return jsonify({'error': 'Device address is required'}), 400

    try:
        if os_type == 'Windows':
            return connect_to_windows_device(device_address)
        elif os_type == 'Linux':
            return connect_to_linux_device(device_address)
        elif os_type == 'Android':
            return jsonify({"message": "Use Web Bluetooth API on Android"}), 200
        else:
            return jsonify({"error": "Unsupported OS"}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

### OS-specific Bluetooth device connection functions ###

def connect_to_windows_device(device_address):
    """Placeholder for connecting to a Bluetooth device on Windows."""
    return jsonify({'message': f"Connecting to Windows Bluetooth device {device_address}..."}), 200

def connect_to_linux_device(device_address):
    """Connect to a Bluetooth device on Linux using pybluez."""
    import bluetooth
    service_matches = bluetooth.find_service(address=device_address)
    if service_matches:
        return jsonify({'message': f"Connected to {device_address}"}), 200
    else:
        return jsonify({'error': f"No services found for {device_address}"}), 404

if __name__ == '__main__':
    app.run(debug=True)
