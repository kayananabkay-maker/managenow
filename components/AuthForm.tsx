'use client'

import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
// Using SQLite for local database authentication
import { signIn, signUp } from '@/lib/actions/user.actions.sqlite'
import { authFormSchema } from '@/lib/utils'

const AuthForm = ({ type }: { type: string }) => {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const formSchema = authFormSchema(type)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true)
    
    try {
      if (type === 'sign-up') {
        const userData = {
          firstName: data.firstName!,
          lastName: data.lastName!,
          address1: data.address1 || '',
          city: data.city || '',
          state: '',
          postalCode: data.postalCode || '',
          dateOfBirth: data.dateOfBirth || '',
          ssn: data.ssn || '',
          email: data.email,
          password: data.password
        }

        const response = await signUp(userData)
        
        if (response.success) {
          router.push('/sign-in')
        }
      }

      if (type === 'sign-in') {
        const response = await signIn({
          email: data.email,
          password: data.password,
        })

        if (response.success) {
          router.push('/')
        }
      }
    } catch (error: any) {
      console.error('Authentication error:', error)
      alert(`Error: ${error.message || 'Authentication failed. Please try again.'}`)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <section className="flex min-h-screen w-full max-w-[420px] flex-col justify-center gap-5 py-10 md:gap-8">
      <header className='flex flex-col gap-5 md:gap-8'>
        <Link href={type === 'sign-up' ? '/sign-in' : '/'} className="cursor-pointer flex items-center gap-2 px-4">
          <Image
            src="/icons/logo.svg"
            width={34}
            height={34}
            alt="ManageNow logo"
          />
          <h1 className="text-26 font-ibm-plex-serif font-bold text-black-1">
            ManageNow
          </h1>
        </Link>

        <div className="flex flex-col gap-1 md:gap-3 px-4">
          <h1 className="text-24 lg:text-36 font-semibold text-gray-900">
            {user
              ? 'Link Account'
              : type === 'sign-in'
              ? 'Sign In'
              : 'Sign Up'
            }
          </h1>
          <p className="text-16 font-normal text-gray-600">
            {user
              ? 'Link your account to get started'
              : 'Please enter your details'
            }
          </p>
        </div>
      </header>
      
      {user ? (
        <div className="flex flex-col gap-4 px-4">
          <p className="text-14 font-normal text-gray-600">
            Account linking will be available soon
          </p>
        </div>
      ) : (
        <>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-4">
              
              {type === 'sign-up' && (
                <>
                  <div className="flex gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel className="text-14 font-medium text-gray-700">
                            First Name
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your first name" 
                              className="rounded-lg border border-gray-300 text-16 placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="text-12 text-red-500" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel className="text-14 font-medium text-gray-700">
                            Last Name
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your last name" 
                              className="rounded-lg border border-gray-300 text-16 placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="text-12 text-red-500" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-14 font-medium text-gray-700">
                          Address <span className="text-gray-500">(Optional)</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your address" 
                            className="rounded-lg border border-gray-300 text-16 placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-12 text-red-500" />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel className="text-14 font-medium text-gray-700">
                            City <span className="text-gray-500">(Optional)</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your city" 
                              className="rounded-lg border border-gray-300 text-16 placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="text-12 text-red-500" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel className="text-14 font-medium text-gray-700">
                            Postal Code <span className="text-gray-500">(Optional)</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ex: 12345" 
                              className="rounded-lg border border-gray-300 text-16 placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="text-12 text-red-500" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-4">
                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel className="text-14 font-medium text-gray-700">
                            Date of Birth <span className="text-gray-500">(Optional)</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="YYYY-MM-DD" 
                              className="rounded-lg border border-gray-300 text-16 placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="text-12 text-red-500" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ssn"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel className="text-14 font-medium text-gray-700">
                            SSN <span className="text-gray-500">(Optional)</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ex: 1234" 
                              className="rounded-lg border border-gray-300 text-16 placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="text-12 text-red-500" />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-14 font-medium text-gray-700">
                      Email
                    </FormLabel>
                    <div className="flex w-full flex-col">
                      <FormControl>
                        <Input
                          placeholder="Enter your email"
                          type="email"
                          className="rounded-lg border border-gray-300 text-16 placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-12 text-red-500 mt-2" />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-14 font-medium text-gray-700">
                      Password
                    </FormLabel>
                    <div className="flex w-full flex-col">
                      <FormControl>
                        <Input
                          placeholder="Enter your password"
                          type="password"
                          className="rounded-lg border border-gray-300 text-16 placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-12 text-red-500 mt-2" />
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-4 pt-2">
                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  className="w-full rounded-lg bg-blue-600 py-3 text-16 font-semibold text-white shadow-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </span>
                  ) : (
                    type === 'sign-in' ? 'Sign In' : 'Sign Up'
                  )}
                </Button>
              </div>
            </form>
          </Form>

          <footer className="flex justify-center gap-1 px-4 pt-2">
            <p className="text-14 font-normal text-gray-600">
              {type === 'sign-in'
                ? "Don't have an account?"
                : "Already have an account?"}
            </p>
            <Link href={type === 'sign-in' ? '/sign-up' : '/sign-in'} className="text-14 font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              {type === 'sign-in' ? 'Sign up' : 'Sign in'}
            </Link>
          </footer>
        </>
      )}
    </section>
  )
}

export default AuthForm
