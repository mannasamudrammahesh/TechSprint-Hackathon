# Mindful Visualizer

An interactive 3D particle system for meditation and biofeedback visualization, integrated into the Healix mental health platform.

## Features

### 🎨 **Visual Shapes**
- **Sphere**: Classic meditation orb
- **Heart**: Love and compassion visualization  
- **Flower**: Growth and blooming patterns
- **DNA**: Life force and healing energy
- **Spiral**: Hypnotic and centering patterns
- **Saturn**: Cosmic and planetary meditation
- **Buddha**: Spiritual and mindful forms
- **Fireworks**: Celebration and release

### 🎮 **Control Modes**

#### 1. **Hand Tracking** 👋
- Uses AI-powered hand detection via MediaPipe
- **Open hand** = Particles expand (relaxed state)
- **Closed fist** = Particles contract (tense state)
- **Clap gesture** = Explosion effect

#### 2. **Audio Breath** 🎤
- Microphone-based breath detection
- **Inhale (silence)** = Particles expand
- **Exhale (sound)** = Particles contract
- Perfect for guided breathing exercises

#### 3. **Visual Breath** 📹
- Camera-based shoulder movement tracking
- **Shoulders up (inhale)** = Particles expand
- **Shoulders down (exhale)** = Particles contract
- Auto-calibrates to user's natural range

### 🎵 **Audio Feedback**
- Ambient drone sounds that respond to tension levels
- Higher tension = muffled, underwater sounds
- Lower tension = bright, airy tones
- Toggle on/off as needed

### 🎨 **Color Palettes**
- **Cyan**: Calming and cool
- **Magenta**: Energetic and vibrant
- **Gold**: Warm and luxurious
- **Emerald**: Natural and grounding
- **Lavender**: Peaceful and soothing

## Technology Stack

- **React 18** with TypeScript
- **Three.js** for 3D graphics and WebGL shaders
- **MediaPipe** for AI-powered hand and pose detection
- **Web Audio API** for real-time audio analysis and synthesis
- **Tailwind CSS** for responsive UI design

## Integration with Healix

This feature seamlessly integrates with the existing Healix platform:

- **Authentication**: Uses Healix's existing auth system
- **Navigation**: Added to both mobile and desktop navigation
- **UI Consistency**: Matches Healix's design language
- **Responsive Design**: Works on all device sizes
- **Performance**: Optimized for smooth 60fps experience

## Usage

1. Navigate to `/mindful-visualizer` in the Healix app
2. Choose your preferred control mode (Hand, Audio Breath, or Visual Breath)
3. Grant camera/microphone permissions when prompted
4. Select a shape and color that resonates with you
5. Begin your mindful visualization session
6. Use the biofeedback to guide your meditation practice

## Benefits for Mental Health

- **Stress Reduction**: Visual feedback helps users achieve relaxed states
- **Breathing Exercises**: Guided breath work with real-time feedback
- **Mindfulness Training**: Focus attention on present-moment awareness
- **Biofeedback Learning**: Understand your body's stress responses
- **Meditation Enhancement**: Beautiful visuals support deeper practice
- **Accessibility**: Multiple input methods accommodate different abilities

## Privacy & Security

- All processing happens locally in the browser
- No video/audio data is transmitted or stored
- Camera and microphone access is only used for real-time analysis
- Fully compliant with Healix's privacy standards