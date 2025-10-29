import AnimatedSignUpForm from "@/components/AnimatedSignUpForm";

export const metadata = {
  title: 'Sign Up - Healix',
  description: 'Create your Healix account',
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#d6e2ea' }}>
      <AnimatedSignUpForm />
    </div>
  );
}
