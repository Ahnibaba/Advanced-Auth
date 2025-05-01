import { motion } from "framer-motion"
import Input from "../components/Input"
import { useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import PasswordStrengthMeter from "../components/PasswordStrengthMeter"
import { User, Mail, Lock, Loader } from "lucide-react"
import { useAuthStore } from "../store/authStore"
import ReCAPTCHA from "react-google-recaptcha";
import toast from "react-hot-toast"
import axios from "../lib/axios"

const SignupPage = () => {

    const [values, setValues] = useState({
        name: "",
        email: "",
        password: "",  
    })
    const [token, setToken] = useState("")

    const { signup, error, isLoading } = useAuthStore()

    const navigate = useNavigate()
    const recaptchaRef = useRef()

    const handleOnChange = (e) => {
      const name = e.target.name
      const value = e.target.value

      setValues((prev) => ({ ...prev, [name]: value }))
    }

  const handleSignup = async (e) => {
    e.preventDefault()
    
    try {
      await submitRecaptcha()
      await signup(values)
      navigate("/verify-email")
    } catch (error) {
      console.log(error);
      toast.error(error.message)
      
    }
  } 
  
  const onChangeRecaptcha = (recaptchaToken) => {
    setToken(recaptchaToken)
  }

  const submitRecaptcha = async() => {
    if(token) {
     const response = await axios.post("/auth/test-recaptcha", { token })
     console.log(response);
     
     setToken("")
     recaptchaRef.current.reset()
    } else {
     throw new Error("Verify you are not a robot")
    }
  
 }

  
  
  return (
    <motion.div
     initial={{opacity: 0, y: 20}}
     animate={{opacity: 1, y: 0}}
     transition={{duration: 0.5}}
     className="max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden"
    >
        <div className="p-8">
          <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
            Create Account
          </h2>

          <form onSubmit={handleSignup}>
            <Input  
              icon={User}
              type="text"
              placeholder="Full Name"
              name="name"
              value={values.name}
              onChange={handleOnChange}
            />
            <Input  
              icon={Mail}
              type="email"
              placeholder="Email Address"
              name="email"
              value={values.email}
              onChange={handleOnChange}
            />
            <Input  
              icon={Lock}
              type="password"
              placeholder="Password"
              name="password"
              value={values.password}
              onChange={handleOnChange}
            />
             <ReCAPTCHA
               sitekey="6LevYiorAAAAABRA5nUVTWbL8UWnVidw6ls9Cc8t"
                onChange={onChangeRecaptcha}
                ref={recaptchaRef}
             />
            {error && <p className="text-red-500 font-semibold mt-2">{error}</p>}
            {/* Password strength meter */}
            <PasswordStrengthMeter password={values.password} />
             
             <motion.button
               className="mt-5 w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg
               shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
               focus:ring-offset-gray-900 transition duration-200"
               whileHover={{ scale: 1.02 }}
               whileTap={{ scale: 0.98 }}
               type="submit"
               disabled={isLoading}
             >
                {isLoading ? <Loader className="animate-spin mx-auto" size={24} /> : "Sign Up"}
             </motion.button>
          </form>
        </div>

        <div className="px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center">
          <p className="text-sm text-gray">
            Already have an account?{" "}
            <Link to={"/login"} className="text-green-400 hover:underline">
              Login
            </Link>
          </p>
        </div>

    </motion.div>
  )
}

export default SignupPage