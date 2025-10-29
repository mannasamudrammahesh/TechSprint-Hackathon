"use client";

import Image from "next/image";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { useState } from "react";
import { BeatLoader } from "react-spinners";
import { StickyBackButton } from "@/components/BackButton";

export default function Contact() {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // create a function to validate the email
  const validateEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  // create a function to validate the name
  const validateName = (name: string) => {
    const re = /^[a-zA-Z ]{2,30}$/;
    return re.test(name);
  };

  const validateForm = () => {
    if (!validateName(name)) {
      toast.error("Please enter the valid name");
      return false;
    }
    if (!validateEmail(email)) {
      toast.error("Please enter the valid email");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        setLoading(true);

        const response = await fetch("/api/contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            message: message.trim(),
          }),
        });

        const data = await response.json();

        setLoading(false);

        if (!response.ok || data.error) {
          toast.error(data.error || "Failed to send message");
          return;
        }

        // Success - clear form and show success message
        toast.success(data.message || "Message sent successfully! We'll get back to you within 24 hours.", {
          duration: 5000,
          icon: "✅",
        });
        
        // Clear form fields
        setName("");
        setEmail("");
        setMessage("");

      } catch (error) {
        setLoading(false);
        console.error("Contact form error:", error);
        toast.error("Something went wrong. Please try again later or email us directly at help.healix@gmail.com");
      }
    }
  };

  return (
    <div className="text-extrabold flex flex-col lg:flex-row lg:justify-around items-center overflow-x-hidden mt-4 md:mt-10 lg:mt-5 mb-10 px-4 md:px-6">
      <Toaster />
      <div className="flex flex-col lg:justify-around lg:gap-40 lg:h-3/4 items-center mb-8 md:mb-20 lg:mb-0 gap-4 md:gap-10">
        <div className="flex flex-col gap-2 md:gap-5">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-center">Contact us</h1>
          <p className="text-sm sm:text-base md:text-lg w-full max-w-xs md:w-80 text-center px-2 md:px-4">
            Fill up the form and my team will get back to you within 24 hours
          </p>
        </div>
        <div className="flex flex-col gap-4 md:gap-5">
          <span className="flex gap-3 md:gap-5 items-center">
            <Image
              src="/gmail.png"
              className="hover:scale-110 transition ease-in-out flex-shrink-0"
              alt="email"
              width={20}
              height={20}
            />
            <p className="text-sm md:text-base break-all">help.healix@gmail.com</p>
          </span>
          <span className="flex gap-3 md:gap-10 items-center">
            <Image
              src="/instagram.png"
              className="hover:scale-110 transition ease-in-out flex-shrink-0"
              alt="instagram"
              width={20}
              height={20}
            />
            <Link href="https://www.instagram.com/healix_ai?igsh=MXI5YWxtZ3BvcG11cw==">
              <p className="text-sm md:text-base">Healix</p>
            </Link>
          </span>
        </div>
        <div className="flex gap-10">
          
        
        </div>
      </div>
      <div className="flex flex-col justify-center gap-4 md:gap-7 h-3/4 w-full max-w-md px-4">
        <div className="flex justify-center">
          <Image
            src="/customer-service.png"
            className="hover:scale-110 transition ease-in-out mb-1 mt-2 md:mt-10"
            alt="contact"
            width={50}
            height={60}
          />
        </div>
        <div className="flex flex-col gap-1.5 md:gap-2">
          <label htmlFor="text-input" className="font-bold text-xs sm:text-sm md:text-base">
            Name:
          </label>
          <input
            type="text"
            id="text-input"
            className="border outline-0 border-1 h-9 md:h-10 rounded-md p-2 font-normal w-full focus:border-blue-500 focus:border-2 text-xs sm:text-sm md:text-base"
            placeholder="Enter the name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
          />
        </div>
        <div className="flex flex-col gap-1.5 md:gap-2">
          <label htmlFor="email-input" className="font-bold text-xs sm:text-sm md:text-base">
            Email:
          </label>
          <input
            type="email"
            id="email-input"
            className="border outline-0 border-1 h-9 md:h-10 rounded-md p-2 font-normal w-full focus:border-blue-500 focus:border-2 text-xs sm:text-sm md:text-base"
            placeholder="Enter the email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />
        </div>
        <div className="flex flex-col gap-1.5 md:gap-2">
          <label htmlFor="textarea-input" className="font-bold text-xs sm:text-sm md:text-base">
            Message:
          </label>
          {/* @ts-ignore */}
          <textarea
            name=""
            placeholder="Enter the message"
            id="textarea-input"
            cols={30}
            rows={8}
            className="border outline-0 border-1 h-28 md:h-40 rounded-md p-2 font-normal w-full focus:border-blue-500 focus:border-2 text-xs sm:text-sm md:text-base"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
            }}
          ></textarea>
        </div>
        <div>
          {/* @ts-ignore */}
          <button
            className="w-full font-bold bg-black text-white px-4 md:px-5 py-2.5 md:py-3 rounded-md border border-2 transition ease-in-out mb-6 lg:mb-0 text-xs sm:text-sm md:text-base"
            onClick={() => handleSubmit()}
          >
            {loading ? <BeatLoader size={8} color="white" /> : "Send Message"}
          </button>
        </div>
      </div>
    </div>
  );
}
