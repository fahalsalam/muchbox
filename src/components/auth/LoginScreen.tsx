import React from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { ChefHat, Utensils, Clock, Award } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import LoadingSpinner from '@/components/ui/loading-spinner'
import { LoginCredentials } from '@/types'

interface LoginScreenProps {
  onLogin: (credentials: LoginCredentials) => void
  isLoading: boolean
}

const loginSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, 'Username must be at least 3 characters')
    .required('Username is required'),
  password: Yup.string()
    .required('Password is required'),
})

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, isLoading }) => {
  const handleSubmit = (values: LoginCredentials) => {
    onLogin(values)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand to-brand-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
              <ChefHat className="h-8 w-8 animate-icon-breathe" />
            </div>
            <h1 className="text-4xl font-bold">MunchBox</h1>
          </div>

          {/* Tagline */}
          <p className="text-xl text-center mb-12 max-w-md">
            Kitchen Order & Customer Management System
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 gap-6 max-w-md">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Utensils className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">Order Management</h3>
                <p className="text-sm text-white/80">Streamline your order process</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">Real-time Kitchen</h3>
                <p className="text-sm text-white/80">Live kitchen order tracking</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">Customer Analytics</h3>
                <p className="text-sm text-white/80">Insights and reporting</p>
              </div>
            </div>
          </div>
        </div>

        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full animate-pulse" />
          <div className="absolute top-40 right-20 w-16 h-16 bg-white rounded-full animate-pulse delay-1000" />
          <div className="absolute bottom-40 left-20 w-12 h-12 bg-white rounded-full animate-pulse delay-2000" />
          <div className="absolute bottom-20 right-40 w-24 h-24 bg-white rounded-full animate-pulse delay-500" />
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center space-x-3 mb-8">
            <div className="p-2 bg-brand/10 rounded-full">
              <ChefHat className="h-6 w-6 text-brand" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">MunchBox</h1>
          </div>

          <Card className="shadow-lg border-0">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
              <CardDescription className="text-center">
                Sign in to your MunchBox account to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Formik
                initialValues={{ username: '', password: '' }}
                validationSchema={loginSchema}
                onSubmit={handleSubmit}
              >
                {({ errors, touched }) => (
                  <Form className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Field
                        as={Input}
                        id="username"
                        name="username"
                        type="text"
                        placeholder="Enter your username"
                        className={errors.username && touched.username ? 'border-destructive' : ''}
                        disabled={isLoading}
                      />
                      <ErrorMessage name="username" component="div" className="text-sm text-destructive" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Field
                        as={Input}
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Enter your password"
                        className={errors.password && touched.password ? 'border-destructive' : ''}
                        disabled={isLoading}
                      />
                      <ErrorMessage name="password" component="div" className="text-sm text-destructive" />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <LoadingSpinner size="sm" variant="white" label="Signing in..." />
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </Form>
                )}
              </Formik>

              {/* Demo Credentials Info */}
              <div className="mt-6 p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground text-center">
                  Demo Credentials: Use any username/password for testing
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              © 2024 MunchBox. Professional Kitchen Management.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginScreen
