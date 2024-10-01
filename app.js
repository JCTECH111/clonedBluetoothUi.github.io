const connectDeviceButton = document.getElementById('connectDeviceButton');
const bluetoothModal = document.getElementById('bluetoothModal');
const bluetoothDeviceList = document.getElementById('bluetoothDeviceList');
const closeModalButton = document.getElementById('closeModalButton');
const previousDevicesList = document.getElementById('previousDevicesList');
const notification = document.getElementById('notification');
const notificationText = document.getElementById('notificationText');

// Function to check if the device is mobile
function isMobileDevice() {
    return /Mobi|Android/i.test(navigator.userAgent);
}

// Show the Bluetooth search modal and discover devices
connectDeviceButton.addEventListener('click', async () => {
    bluetoothModal.classList.remove('hidden');
    bluetoothDeviceList.innerHTML = '';  // Clear previous search results

    try {
        let devices;

        if (isMobileDevice()) {
            // Use Web Bluetooth API for mobile devices
            devices = await discoverBluetoothDevicesWeb();
        } else {
            // Use the Python API for desktop devices
            const response = await fetch('http://127.0.0.1:5000/discover_devices');
            devices = await response.json();
        }

        // Log the devices for debugging
        console.log('Discovered Bluetooth devices:', devices);

        if (!devices || devices.length === 0) {
            notificationText.textContent = 'No Bluetooth devices found.';
            showNotification();
            console.warn('No Bluetooth devices found.');
            alert('No Bluetooth devices found.');
        } else {
            // Display discovered devices in the list
            devices.forEach(device => {
                const deviceItem = document.createElement('li');
                deviceItem.classList.add('flex', 'justify-between', 'items-center', 'mb-2');
                deviceItem.innerHTML = `
                    <span>${device.name || 'Unknown Device'}</span>
                    <button class="py-1 px-3 bg-blue-600 rounded-lg add-device">Add</button>
                `;
                bluetoothDeviceList.appendChild(deviceItem);
    
                const addButton = deviceItem.querySelector('.add-device');
                addButton.addEventListener('click', () => connectToDevice(device));
            });
        }
    } catch (error) {
        console.error('Error discovering Bluetooth devices:', error);
        notificationText.textContent = error.message || 'An error occurred.';
        showNotification();
        bluetoothModal.classList.add('hidden');
    }
});

// Use Web Bluetooth API to discover devices on mobile
async function discoverBluetoothDevicesWeb() {
    try {
        const devices = await navigator.bluetooth.requestDevice({
            filters: [{ services: ['battery_service'] }] // Adjust the filters as needed
        });
        return [{ name: devices.name, address: devices.id }]; // return an array of devices
    } catch (error) {
        console.error('Error requesting Bluetooth devices:', error);
        throw new Error('Web Bluetooth error: ' + error.message);
    }
}

// Connect to the selected device and update notification
async function connectToDevice(device) {
    try {
        const response = await fetch('http://127.0.0.1:5000/connect_device', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ address: device.address })
        });
   
        const result = await response.json();
        console.log(result);

        notificationText.textContent = result.message || result.error;
        showNotification();

        bluetoothModal.classList.add('hidden');  // Close the modal on success
    } catch (error) {
        console.error('Failed to connect to the device:', error);
    }
}

// Show notification for success or error
function showNotification() {
    notification.classList.remove('hidden');
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

// Close the modal
closeModalButton.addEventListener('click', () => {
    bluetoothModal.classList.add('hidden');
});
