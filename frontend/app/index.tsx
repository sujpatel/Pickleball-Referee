import { CameraView, CameraType ,useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { Button, StyleSheet, TouchableOpacity, View, Text, Image } from 'react-native';

export default function App() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const cameraRef = useRef<CameraView | null>(null);
  const [points, setPoints] = useState<Array<{ x: number; y: number }>>([]);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(currentCam => (currentCam === 'back' ? 'front' : 'back'));
  }

  async function freezeFrame() {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setPhotoUri(photo.uri);
      setPoints([]);
    }
  }

  function resumeCamera() {
    setPhotoUri(null);
    setPoints([]);
  }

  return (
    <View style={styles.container}>
      {photoUri ? (
        <TouchableOpacity activeOpacity={1} style={styles.camera} onPress={(e) => {
          const { locationX, locationY } = e.nativeEvent;
          setPoints(prev=> [...prev, { x: locationX, y: locationY }]);
        }}
        >
          <Image source={{ uri: photoUri }} style={styles.camera} />
          {points.map((p, i) => (
            <View
              key={i}
              style={{
                position:'absolute',
                left: p.x - 5,
                top: p.y - 5,
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: 'red',
              }}
            />
          ))}
          
        </TouchableOpacity>
      ) : (
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
        />
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
          <Text style={styles.text}>Flip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={photoUri ? resumeCamera : freezeFrame}
        >
          <Text style={styles.text}>
            {photoUri ? 'Resume' : 'Freeze'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 64,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    width: '100%',
    paddingHorizontal: 64,
  },
  button: {
    flex: 1,
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});
