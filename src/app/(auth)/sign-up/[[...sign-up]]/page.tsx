import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="flex h-screen">
      {/* Left Side */}
      <div className="hidden md:flex w-1/2 bg-gray-900 text-white flex-col justify-center items-center p-10">
        <h1 className="text-4xl font-bold mb-4">Join Edigo 🎓</h1>
        <p className="max-w-md text-gray-300 text-center">
          Start your learning journey or share your knowledge with students around the world.
        </p>
      </div>

      {/* Right Side */}
      <div className="flex w-full md:w-1/2 justify-center items-center bg-white">
        <SignUp
          path="/sign-up"
          routing="path"
          signInUrl="/sign-in"
          forceRedirectUrl="/onboarding/role-selection"
          appearance={{
            elements: {
              card: "shadow-lg p-6 rounded-xl",
              headerTitle: "text-xl font-bold",
              formButtonPrimary: "bg-black hover:bg-gray-800 text-white",
            }
          }}
        />
      </div>
    </div>
  )
}