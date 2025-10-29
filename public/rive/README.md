# Rive Animations for MoodPet Companion

This directory contains Rive animation files (.riv) for the MoodPet companion feature.

## 🎯 **CURRENT STATUS: WORKING WITH BEAR ANIMATION**

✅ **bear.riv** - **ACTIVE** - Loaded from `/public/bear.riv`
❌ **cat.riv** - Not available (using fallback)
❌ **dog.riv** - Not available (using fallback)  
❌ **rabbit.riv** - Not available (using fallback)
❌ **bird.riv** - Not available (using fallback)

## 🎭 **Rive Animation Integration Status**

### ✅ **WORKING FEATURES:**
- **Rive Loading**: Successfully loads bear.riv animation
- **Emotion Triggers**: Facial expressions change based on detected emotions
- **Camera Integration**: Real-time emotion detection from webcam
- **Hugging Face Models**: Multiple AI models for emotion recognition
- **Fallback System**: Emoji animations when Rive files unavailable
- **Manual Testing**: Emotion trigger buttons for testing

### 🎮 **How to Test:**
1. **Visit `/emotion-test`** - Comprehensive testing interface
2. **Click emotion buttons** - Manually trigger bear animations
3. **Start camera detection** - Real-time emotion mirroring
4. **Make facial expressions** - Watch bear respond to your emotions

## 📋 **Required Rive Animation Structure**

Each .riv file should contain:

### State Machine: "State Machine 1"

### Required Trigger Inputs:
- **happy** (Trigger): Triggers happy facial expression
- **sad** (Trigger): Triggers sad facial expression  
- **angry** (Trigger): Triggers angry facial expression
- **surprised** (Trigger): Triggers surprised facial expression
- **fear** (Trigger): Triggers fearful facial expression
- **neutral** (Trigger): Triggers neutral/idle state

### Optional Number Inputs:
- **intensity** (Number): Controls animation intensity (0.0 - 1.0)

### Animation States:
- **Idle/Neutral**: Default calm state
- **Happy**: Joyful expressions with bouncing movements
- **Sad**: Melancholy expressions with drooped posture
- **Angry**: Frustrated expressions with aggressive stance
- **Surprised**: Startled expressions with wide eyes
- **Fear**: Fearful expressions with protective posture
- **Disgust**: Uncomfortable expressions

## 🚀 **How to Add More Rive Animations**

### Step 1: Obtain Rive Files
- **Download from Rive Community**: https://rive.app/community/files/
- **Create custom animations**: https://rive.app/
- **Use existing bear.riv as reference**

### Step 2: Setup State Machine
```
State Machine Name: "State Machine 1"

Trigger Inputs:
- happy (Trigger)
- sad (Trigger)  
- angry (Trigger)
- surprised (Trigger)
- fear (Trigger)
- neutral (Trigger)

Number Inputs:
- intensity (Number, 0.0-1.0)
```

### Step 3: Place Files
```
/public/rive/
├── bear.riv ✅ (working)
├── cat.riv (add here)
├── dog.riv (add here)
├── rabbit.riv (add here)
└── bird.riv (add here)
```

### Step 4: Test Integration
1. Visit `/emotion-test`
2. Check Rive loading status
3. Test manual emotion triggers
4. Verify camera emotion detection

## 🔧 **Technical Implementation Details**

### Rive Integration:
```typescript
// Rive setup
const { rive, RiveComponent } = useRive({
  src: '/bear.riv',
  stateMachines: "State Machine 1",
  autoplay: true
});

- Keep file sizes under 1MB for optimal loading
- Use efficient vector graphics
- Minimize the number of bones and constraints
- Test on mobile devices for performance
- Use appropriate frame rates (24-30 fps recommended)

## Troubleshooting

**Animation not loading?**
- Check file name matches exactly (case-sensitive)
- Verify State Machine name is "State Machine 1"
- Ensure all required inputs exist
- Check browser console for errors

**Emotions not changing?**
- Verify input names match exactly
- Check State Machine transitions
- Test with manual input values first

**Performance issues?**
- Reduce animation complexity
- Lower frame rate
- Optimize vector graphics
- Check file size

## Support

For issues with Rive animations:
1. Check the browser console for errors
2. Verify file structure and naming
3. Test animations in Rive Editor first
4. Consult Rive documentation: https://help.rive.app/
