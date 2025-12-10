import AuthForm from "@/components/auth/AuthForm";
import Navbar from "@/components/Navbar";

export default function LoginPage() {
    return (
        <main className="min-h-screen bg-background relative flex flex-col">
            <Navbar />
            <div className="flex-1 flex items-center justify-center px-4 py-12 relative">
                {/* Background decoration */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-full max-h-[500px] bg-primary/20 blur-[100px] rounded-full -z-10 pointer-events-none"></div>

                <AuthForm type="login" />
            </div>
        </main>
    );
}
