import AnimatedLoginForm from "@/components/AnimatedLoginForm";

export const metadata = {
  title: 'Sign In - Healix',
  description: 'Sign in to your Healix account',
};

export default function SignInPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#d6e2ea' }}>
            <AnimatedLoginForm />
        </div>
    );
}
