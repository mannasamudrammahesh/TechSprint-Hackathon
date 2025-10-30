"use client";
import React, { useRef, useState, ChangeEvent, SyntheticEvent, useEffect } from 'react';
import { useRive, useStateMachineInput, Layout, Fit, Alignment } from 'rive-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signUpWithEmail } from '@/lib/supabaseAuth';
import './AnimatedLoginForm.css';
const STATE_MACHINE_NAME = 'Login Machine';
const AnimatedSignUpForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const { rive: riveInstance, RiveComponent } = useRive({
    src: '/login-teddy.riv',
    stateMachines: STATE_MACHINE_NAME,
    autoplay: true,
    layout: new Layout({
      fit: Fit.Cover,
      alignment: Alignment.Center,
    }),
  });
  const [emailValue, setEmailValue] = useState('');
  const [passValue, setPassValue] = useState('');
  const [inputLookMultiplier, setInputLookMultiplier] = useState(0);
  const [signUpButtonText, setSignUpButtonText] = useState('Sign Up');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const isCheckingInput = useStateMachineInput(
    riveInstance,
    STATE_MACHINE_NAME,
    'isChecking'
  );
  const numLookInput = useStateMachineInput(
    riveInstance,
    STATE_MACHINE_NAME,
    'numLook'
  );
  const trigSuccessInput = useStateMachineInput(
    riveInstance,
    STATE_MACHINE_NAME,
    'trigSuccess'
  );
  const trigFailInput = useStateMachineInput(
    riveInstance,
    STATE_MACHINE_NAME,
    'trigFail'
  );
  const isHandsUpInput = useStateMachineInput(
    riveInstance,
    STATE_MACHINE_NAME,
    'isHandsUp'
  );
  useEffect(() => {
    if (inputRef?.current && !inputLookMultiplier) {
      setInputLookMultiplier(inputRef.current.offsetWidth / 100);
    }
  }, [inputRef, inputLookMultiplier]);
  const onEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setEmailValue(newVal);
    setError('');
    if (isCheckingInput && !isCheckingInput.value) {
      isCheckingInput.value = true;
    }
    const numChars = newVal.length;
    if (numLookInput) {
      numLookInput.value = numChars * inputLookMultiplier;
    }
  };
  const onEmailFocus = () => {
    if (isCheckingInput) {
      isCheckingInput.value = true;
    }
    if (numLookInput && emailValue.length > 0) {
      numLookInput.value = emailValue.length * inputLookMultiplier;
    }
  };
  const onSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setSignUpButtonText('Creating...');
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      await signUpWithEmail(emailValue, passValue);
      if (trigSuccessInput) {
        trigSuccessInput.fire();
      }
      setSignUpButtonText('Sign Up');
      setSuccess('Account created! Please check your email to verify your account.');
      setIsLoading(false);
      // Preserve redirect URL when going to sign-in
      const redirectTo = searchParams.get('redirectTo');
      const signInUrl = redirectTo ? `/sign-in?redirectTo=${encodeURIComponent(redirectTo)}` : '/sign-in';
      setTimeout(() => {
        router.push(signInUrl);
      }, 3000);
    } catch (err: any) {
      console.error('Sign up error:', err);
      setSignUpButtonText('Sign Up');
      setIsLoading(false);
      if (trigFailInput) {
        trigFailInput.fire();
      }
      setError(err.message || 'Failed to create account');
    }
  };
  return (
    <div className="login-form-component-root">
      <div className="login-form-wrapper">
        <div className="rive-wrapper">
          <RiveComponent className="rive-container" />
        </div>
        <div className="form-container">
          <form onSubmit={onSubmit}>
            <label>
              <input
                type="email"
                className="form-username"
                name="email"
                placeholder="Email"
                onFocus={onEmailFocus}
                value={emailValue}
                onChange={onEmailChange}
                onBlur={() => {
                  if (isCheckingInput) {
                    isCheckingInput.value = false;
                  }
                }}
                ref={inputRef}
                required
              />
            </label>
            <label>
              <input
                type="password"
                className="form-pass"
                name="password"
                placeholder="Password (min 6 characters)"
                value={passValue}
                onFocus={() => {
                  if (isHandsUpInput) {
                    isHandsUpInput.value = true;
                  }
                }}
                onBlur={() => {
                  if (isHandsUpInput) {
                    isHandsUpInput.value = false;
                  }
                }}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setPassValue(e.target.value)
                }
                required
                minLength={6}
              />
            </label>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            <button className="login-btn" type="submit" disabled={isLoading}>
              {signUpButtonText}
            </button>
          </form>
          <div className="form-footer">
            <p>
              Already have an account?{' '}
              <a href="/sign-in" className="signup-link">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AnimatedSignUpForm;
