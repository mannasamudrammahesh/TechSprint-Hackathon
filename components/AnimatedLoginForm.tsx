"use client";

import React, { useRef, useState, ChangeEvent, SyntheticEvent, useEffect } from 'react';
import { useRive, useStateMachineInput, Layout, Fit, Alignment } from 'rive-react';
import { useRouter } from 'next/navigation';
import { signInWithEmail } from '@/lib/supabaseAuth';
import './AnimatedLoginForm.css';

const STATE_MACHINE_NAME = 'Login Machine';

const AnimatedLoginForm = () => {
  const router = useRouter();
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
  const [loginButtonText, setLoginButtonText] = useState('Login');
  const [error, setError] = useState('');

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

    setLoginButtonText('Checking...');
    setError('');
    setIsLoading(true);

    try {
      await signInWithEmail(emailValue, passValue);
      
      // Trigger success animation
      if (trigSuccessInput) {
        trigSuccessInput.fire();
      }
      
      setTimeout(() => {
        router.push('/Home');
      }, 1500);
    } catch (err: any) {
      console.error('Login error:', err);
      setLoginButtonText('Login');
      setIsLoading(false);
      
      // Trigger fail animation
      if (trigFailInput) {
        trigFailInput.fire();
      }
      
      setError(err.message || 'Invalid email or password');
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
                placeholder="Password"
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
              />
            </label>
            {error && <div className="error-message">{error}</div>}
            <button className="login-btn" type="submit" disabled={isLoading}>
              {loginButtonText}
            </button>
          </form>
          <div className="form-footer">
            <p>
              Don't have an account?{' '}
              <a href="/sign-up" className="signup-link">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedLoginForm;
