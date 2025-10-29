# Animated Login Setup Guide

## Important: Rive File Required

The animated login/signup forms require a specific Rive file with the correct state machine setup.

### Download the Teddy Rive File

1. Visit the Teddy community post: https://rive.app/community/1689-login-form-with-teddy/
2. Download the `login-teddy.riv` file
3. Place it in the `Healix-main/public/` directory

### Required State Machine Configuration

The Rive file must have a state machine named **"Login Machine"** with the following inputs:

- `isChecking` (Boolean) - Controls if Teddy's eyes follow the email input
- `isHandsUp` (Boolean) - Controls if Teddy covers eyes during password input
- `numLook` (Number, 0-100) - Controls where Teddy looks from left to right
- `trigSuccess` (Trigger) - Fires when authentication succeeds
- `trigFail` (Trigger) - Fires when authentication fails

### Alternative: Use Your Own Rive File

If you want to use a different Rive animation:

1. Create or download a Rive file with a state machine
2. Update the state machine name and inputs in:
   - `Healix-main/components/AnimatedLoginForm.tsx`
   - `Healix-main/components/AnimatedSignUpForm.tsx`
3. Change the `src` path to point to your Rive file
4. Adjust the input names to match your state machine

### Fallback Option

If you don't want to use the animated login, you can revert to the standard Clerk components by:

1. Restoring the original sign-in page:
```tsx
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
            <SignIn
                appearance={{
                    elements: {
                        rootBox: "mx-auto",
                        card: "shadow-xl"
                    }
                }}
                routing="path"
                path="/sign-in"
                signUpUrl="/sign-up"
            />
        </div>
    );
}
```

2. Restoring the original sign-up page similarly

## Features Implemented

✅ Animated Teddy bear that reacts to user input
✅ Eyes follow email input as user types
✅ Covers eyes when user focuses on password field
✅ Success/fail animations on authentication
✅ Full Clerk authentication integration
✅ Email verification flow for sign-up
✅ Error handling with visual feedback
✅ Responsive design
✅ Smooth transitions between states

## Testing

1. Navigate to `/sign-up` to test the sign-up flow
2. Navigate to `/sign-in` to test the login flow
3. Watch Teddy react to your inputs!

## Troubleshooting

**Issue**: Rive animation doesn't load
- **Solution**: Ensure `login-teddy.riv` is in the `public/` folder
- Check browser console for errors

**Issue**: State machine inputs not working
- **Solution**: Verify the state machine name and input names match exactly
- Open the Rive file in Rive editor to confirm names

**Issue**: Authentication not working
- **Solution**: Check your Clerk environment variables in `.env.local`
- Ensure Clerk is properly configured in your project
