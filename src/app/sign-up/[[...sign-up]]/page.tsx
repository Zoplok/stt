import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-background">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-violet-600/10 blur-[100px]" />
      </div>
      <SignUp
        appearance={{
          elements: {
            rootBox: "relative z-10",
            card: "bg-white/4 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/40 rounded-2xl",
            headerTitle: "text-white",
            headerSubtitle: "text-white/50",
            socialButtonsBlockButton: "bg-white/8 border-white/10 text-white hover:bg-white/12",
            formFieldLabel: "text-white/60",
            formFieldInput: "bg-white/8 border-white/10 text-white placeholder:text-white/30 focus:border-indigo-500",
            footerActionLink: "text-indigo-400",
            formButtonPrimary: "bg-indigo-600 hover:bg-indigo-500",
          },
        }}
      />
    </div>
  );
}
