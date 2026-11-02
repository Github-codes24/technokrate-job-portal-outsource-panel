import React, { useState, useEffect, useRef } from "react";
import {
  Users,
  HelpCircle,
  Headphones,
  FileText,
  Eye,
  EyeOff,
  Plus,
  X,
  ArrowLeft,
  Globe,
  Facebook,
  Instagram,
  MessageCircle,
  Twitter,
  HeadphonesIcon,
  Send,
  Mic,
  ChevronDown,
  ChevronUp,
  ChevronRight,
} from "lucide-react";
import Footer from "../../components/common/Footer";
import CustomDropdown from "../../components/common/CustomDropdown";
import { toast } from "react-toastify";

// ─── DATA ────────────────────────────────────────────────────────────────────

const notificationOptions = [
  "All Notifications",
  "New Candidate Application",
  "Recommended Candidates for your job Post",
  "Job Post Performance Update",
  "New comments on candidate",
  "Hiring Status Update",
];

const faqItems = [
  {
    q: "How do I create an account?",
    a: "To create an account, click the 'Sign Up' button on the homepage. Fill in your details including name, email, and password, then verify your email to complete registration.",
  },
  {
    q: "How can I update my profile information?",
    a: "To update your profile information, go to the profile page and click on edit profile. Make the necessary changes and save them to keep your profile details up to date.",
  },
  {
    q: "What should I do if I forget my password?",
    a: "Click 'Forgot Password?' on the login page. Enter your registered email and we'll send you a reset link within a few minutes.",
  },
  {
    q: "How do I set up alerts for new opportunities?",
    a: "Navigate to Settings > General > Notifications and enable 'New Candidate Application' or any relevant alert type to start receiving notifications.",
  },
  {
    q: "What file formats are accepted for resume uploads?",
    a: "We accept PDF, DOC, and DOCX formats up to 5MB in size.",
  },
  {
    q: "How do I upload my resume to the portal?",
    a: "Go to your Profile page, scroll to the Resume section, and click 'Upload Resume'. Select your file and click Save.",
  },
];

const socialLinks = [
  { label: "Website", icon: Globe, url: "https://www.google.com" },
  { label: "Facebook", icon: Facebook, url: "https://www.facebook.com" },
  { label: "Instagram", icon: Instagram, url: "https://www.instagram.com" },
  { label: "WhatsApp", icon: MessageCircle, url: "https://web.whatsapp.com" },
  { label: "Twitter", icon: Twitter, url: "https://x.com" },
  { label: "Customer Service", icon: HeadphonesIcon, url: "mailto:support@google.com" },
];

const YESTERDAY_MSGS = [
  {
    id: 1,
    sender: "joffre",
    text: "Lorem ipsum dolor sit amet consectetur. Non sit laoreet nulla.",
    time: "08:35 PM",
  },
  {
    id: 2,
    sender: "exec",
    text: "Lorem ipsum dolor sit amet consectetur. Non sit laoreet nulla.",
    time: "08:40 PM",
  },
  {
    id: 3,
    sender: "exec",
    text: "Lorem ipsum dolor sit amet consectetur. Non sit laoreet nulla.",
    time: "08:45 PM",
  },
];

const TODAY_MSGS = [
  {
    id: 4,
    sender: "joffre",
    text: "Lorem ipsum dolor sit amet consectetur. Non sit laoreet nulla.",
    time: "09:23 AM",
  },
  {
    id: 5,
    sender: "joffre",
    text: "Lorem ipsum dolor sit amet consectetur. Non sit laoreet nulla.",
    time: "09:24 AM",
  },
];
// ─── PASSWORD FIELD ───────────────────────────────────────────────────────────

function PasswordField({ label, placeholder = "••••••", value, onChange }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-sm text-gray-600 mb-1">{label}</label>
      <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2.5 gap-2">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="text-gray-400 hover:text-gray-600"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

// ─── TABS ─────────────────────────────────────────────────────────────────────

const TABS = [
  { key: "general", label: "General", icon: Users },
  { key: "faq", label: "FAQ", icon: HelpCircle },
  { key: "support", label: "Support", icon: Headphones },
  { key: "terms", label: "Terms & Services", icon: FileText },
];

// ─── GENERAL TAB ─────────────────────────────────────────────────────────────

function GeneralTab() {
  const [checked, setChecked] = useState(() => {
    try {
      const stored = localStorage.getItem("userNotificationPreferences");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to parse userNotificationPreferences from localStorage", e);
    }
    return {};
  });

  const toggle = (opt) => {
    let nextChecked = { ...checked };
    if (opt === "All Notifications") {
      const targetState = !checked["All Notifications"];
      notificationOptions.forEach((o) => {
        nextChecked[o] = targetState;
      });
    } else {
      nextChecked[opt] = !checked[opt];
      const allOthersChecked = notificationOptions
        .filter((o) => o !== "All Notifications")
        .every((o) => nextChecked[o]);
      nextChecked["All Notifications"] = allOthersChecked;
    }

    setChecked(nextChecked);
    localStorage.setItem("userNotificationPreferences", JSON.stringify(nextChecked));
    toast.success("Notification preferences updated");
  };

  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [preferences, setPreferences] = useState(() => {
    try {
      const stored = localStorage.getItem("userPreferences");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to parse userPreferences from localStorage", e);
    }
    return {
      language: "English",
      location: "Nagpur",
    };
  });

  const [credentials, setCredentials] = useState(() => {
    let profile = {
      name: "Kristian Watson",
      designation: "HR Manager",
      email: "emaple@gmail.com",
      password: "Password@123",
      profilePic: "https://randomuser.me/api/portraits/men/32.jpg",
    };
    try {
      const stored = localStorage.getItem("userProfile");
      if (stored) {
        profile = JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to parse user profile in credentials initialization", e);
    }
    return {
      email: profile.email || "",
      password: profile.password || "",
    };
  });

  const handlePreferenceChange = (key, val) => {
    const updated = { ...preferences, [key]: val };
    setPreferences(updated);
    localStorage.setItem("userPreferences", JSON.stringify(updated));
    toast.success(`${key.charAt(0).toUpperCase() + key.slice(1)} updated to ${val}`);
  };

  const handlePasswordSubmit = () => {
    const { oldPassword, newPassword, confirmPassword } = passwords;

    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required");
      return;
    }

    // Load current profile to check old password
    let profile = {
      name: "Kristian Watson",
      designation: "HR Manager",
      email: "emaple@gmail.com",
      password: "Password@123",
      profilePic: "https://randomuser.me/api/portraits/men/32.jpg",
    };

    try {
      const stored = localStorage.getItem("userProfile");
      if (stored) {
        profile = JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to parse user profile in change password", e);
    }

    if (oldPassword !== profile.password) {
      toast.error("Incorrect old password");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }

    // Update password
    profile.password = newPassword;
    localStorage.setItem("userProfile", JSON.stringify(profile));

    toast.success("Password changed successfully!");
    setPasswords({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setCredentials((prev) => ({ ...prev, password: newPassword }));
  };

  const handleCredentialsSubmit = () => {
    const { email, password } = credentials;

    if (!email || !password) {
      toast.error("Email and password fields are required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    let profile = {
      name: "Kristian Watson",
      designation: "HR Manager",
      email: "emaple@gmail.com",
      password: "Password@123",
      profilePic: "https://randomuser.me/api/portraits/men/32.jpg",
    };

    try {
      const stored = localStorage.getItem("userProfile");
      if (stored) {
        profile = JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to parse user profile in credentials update", e);
    }

    profile.email = email;
    profile.password = password;

    localStorage.setItem("userProfile", JSON.stringify(profile));
    window.dispatchEvent(new Event("profileUpdate"));

    toast.success("Sign in & Security credentials updated successfully!");
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Notifications */}
      <div className="border border-gray-200 rounded-xl p-5">
        <h3 className="font-semibold text-gray-800 mb-4">Notification</h3>
        <div className="flex flex-col gap-3">
          {notificationOptions.map((opt) => (
            <label
              key={opt}
              className="flex items-center gap-3 cursor-pointer text-sm text-gray-700"
            >
              <input
                type="checkbox"
                checked={!!checked[opt]}
                onChange={() => toggle(opt)}
                className="w-4 h-4 accent-purple-600"
              />
              {opt}
            </label>
          ))}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Change Password */}
        <div className="border border-gray-200 rounded-xl p-5 flex flex-col gap-4">
          <h3 className="font-semibold text-gray-800">Change Password</h3>
          <PasswordField
            label="Old Password"
            value={passwords.oldPassword}
            onChange={(e) => setPasswords((p) => ({ ...p, oldPassword: e.target.value }))}
          />
          <PasswordField
            label="New Password"
            value={passwords.newPassword}
            onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
          />
          <PasswordField
            label="Confirm Password"
            value={passwords.confirmPassword}
            onChange={(e) => setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))}
          />
          <button className="text-sm text-purple-600 font-medium text-left hover:underline">
            Forget Password?
          </button>
          <button
            onClick={handlePasswordSubmit}
            className="w-full bg-[#7900BA] hover:bg-purple-800 text-white font-semibold text-sm py-3 rounded-xl transition cursor-pointer shadow-sm"
          >
            Change Password
          </button>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Appearances */}
          <div className="border border-gray-200 rounded-xl p-5">
            <h3 className="font-semibold text-gray-800 mb-4">
              Appearances & Preferences
            </h3>
            <div className="flex flex-col gap-3">
              {/* Language Preference */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Language</label>
                <CustomDropdown
                  value={preferences.language}
                  placeholder="Select Language"
                  options={[
                    { value: "English", label: "English" },
                    { value: "Spanish", label: "Spanish" },
                    { value: "French", label: "French" },
                    { value: "Hindi", label: "Hindi" },
                  ]}
                  onChange={(val) => handlePreferenceChange("language", val)}
                />
              </div>

              {/* Location Preference */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Location</label>
                <CustomDropdown
                  value={preferences.location}
                  placeholder="Select Location"
                  options={[
                    { value: "Nagpur", label: "Nagpur" },
                    { value: "Mumbai", label: "Mumbai" },
                    { value: "Pune", label: "Pune" },
                    { value: "Delhi", label: "Delhi" },
                    { value: "Bangalore", label: "Bangalore" },
                  ]}
                  onChange={(val) => handlePreferenceChange("location", val)}
                />
              </div>
            </div>
          </div>

          {/* Sign in & Security */}
          <div className="border border-gray-200 rounded-xl p-5 flex flex-col gap-4">
            <h3 className="font-semibold text-gray-800">
              Sign in & Security
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Email Id
                </label>
                <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2.5 gap-2">
                  <input
                    type="text"
                    value={credentials.email}
                    onChange={(e) => setCredentials((p) => ({ ...p, email: e.target.value }))}
                    placeholder="example@gmail.com"
                    className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
                  />
                  <Eye size={18} className="text-gray-400 shrink-0" />
                </div>
              </div>
              <PasswordField
                label="Password"
                value={credentials.password}
                onChange={(e) => setCredentials((p) => ({ ...p, password: e.target.value }))}
              />
            </div>
            <button
              onClick={handleCredentialsSubmit}
              className="w-full bg-[#7900BA] hover:bg-purple-800 text-white font-semibold text-sm py-3 rounded-xl transition cursor-pointer shadow-sm mt-2"
            >
              Update Credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── FAQ TAB ──────────────────────────────────────────────────────────────────

function FAQTab() {
  const [open, setOpen] = useState(1);
  return (
    <div className="border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
      {faqItems.map((item, i) => (
        <div
          key={i}
          className={`border rounded-xl overflow-hidden ${open === i ? "border-purple-200" : "border-gray-200"}`}
        >
          <button
            onClick={() => setOpen(open === i ? -1 : i)}
            className="w-full flex items-center justify-between px-5 py-4 text-left"
          >
            <span
              className={`text-sm font-medium ${open === i ? "text-purple-600" : "text-gray-700"}`}
            >
              {item.q}
            </span>
            {open === i ? (
              <X size={16} className="text-gray-400 shrink-0" />
            ) : (
              <Plus size={16} className="text-gray-400 shrink-0" />
            )}
          </button>
          {open === i && (
            <div className="px-5 pb-5">
              <hr className="border-gray-200 mb-3" />
              <p className="text-sm text-gray-500 leading-relaxed">{item.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── SUPPORT TAB ─────────────────────────────────────────────────────────────

function SupportTab({ onChatOpen }) {
  return (
    <div className="border border-gray-200 rounded-xl p-8">
      <p className="text-xs font-semibold text-purple-600 mb-2 uppercase tracking-wide">
        Contact us
      </p>
      <p className="text-sm text-gray-400 mb-1">Who we are</p>
      <h2 className="text-2xl font-bold text-gray-900 mb-3">
        We care about
        <br />
        customer services
      </h2>
      <p className="text-sm text-gray-500 mb-6 max-w-md">
        Want to chat? We'd love to hear from you! Get in touch with our Customer
        Success Team to inquire about speaking events, advertising rates, or
        just say hello.
      </p>
      <button
        onClick={onChatOpen}
        className="bg-purple-700 hover:bg-purple-800 text-white font-semibold text-sm px-6 py-3 rounded-xl transition mb-8"
      >
        Chat Support
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg ml-auto">
        {socialLinks.map(({ label, icon: Icon, url }) => (
          <button
            key={label}
            onClick={() => {
              if (label === "Customer Service") {
                onChatOpen?.();
                return;
              }
              if (url) {
                if (url.startsWith("mailto:")) {
                  window.location.href = url;
                } else {
                  window.open(url, "_blank", "noopener,noreferrer");
                }
              }
            }}
            className="flex items-center justify-between border border-gray-200 rounded-xl px-5 py-4 hover:bg-purple-50/20 hover:border-purple-300 hover:shadow-sm transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <Icon size={18} className="text-gray-500 group-hover:text-purple-600 transition-colors" />
              <span className="text-sm font-semibold text-gray-700 group-hover:text-purple-700 transition-colors">{label}</span>
            </div>
            <ChevronRight size={16} className="text-gray-400 group-hover:text-purple-600 transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── TERMS TAB ───────────────────────────────────────────────────────────────

function TermsTab() {
  return (
    <div className="border border-gray-200 rounded-xl p-6">
      <h3 className="font-semibold text-gray-800 mb-4">Terms & Services</h3>
      {[
        [
          "1. Acceptance of Terms",
          "By accessing and using Outsource Panel, you accept and agree to be bound by these Terms of Service. If you do not agree, please do not use our services.",
        ],
        [
          "2. Use of Services",
          "You may use our services only as permitted by law and according to these terms. We may suspend or terminate your access if you violate any of these terms.",
        ],
        [
          "3. Privacy Policy",
          "Your use of our services is also governed by our Privacy Policy, which is incorporated into these terms by this reference.",
        ],
        [
          "4. User Responsibilities",
          "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.",
        ],
        [
          "5. Modifications",
          "We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes your acceptance of the new terms.",
        ],
      ].map(([title, body]) => (
        <div key={title} className="mb-5">
          <p className="text-sm font-semibold text-gray-700 mb-1">{title}</p>
          <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
        </div>
      ))}
    </div>
  );
}

// ─── CHAT SUPPORT ────────────────────────────────────────────────────────────

function ChatSupport({ onBack }) {
  const [messages, setMessages] = useState({
    yesterday: YESTERDAY_MSGS,
    today: TODAY_MSGS,
  });
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(true);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startRecording = () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        audioChunksRef.current = [];
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          const audioUrl = URL.createObjectURL(audioBlob);

          const voiceMsg = {
            id: Date.now(),
            sender: "joffre",
            audioUrl: audioUrl,
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };

          setMessages((p) => ({ ...p, today: [...p.today, voiceMsg] }));

          setTyping(true);
          setTimeout(() => {
            const execReply = {
              id: Date.now() + 1,
              sender: "exec",
              text: "Thank you for sending the voice message. I am listening to it now and will assist you further.",
              time: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            };
            setMessages((p) => ({ ...p, today: [...p.today, execReply] }));
            setTyping(false);
          }, 2500);
        };

        mediaRecorder.start();
        setIsRecording(true);
        setRecordingSeconds(0);
        recordingIntervalRef.current = setInterval(() => {
          setRecordingSeconds((s) => s + 1);
        }, 1000);
      })
      .catch((err) => {
        console.error("Microphone access denied:", err);
        toast.error("Microphone access is required to record voice messages.");
      });
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
    clearInterval(recordingIntervalRef.current);
    setIsRecording(false);
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.onstop = null; // Prevent sending on stop
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
    clearInterval(recordingIntervalRef.current);
    setIsRecording(false);
    audioChunksRef.current = [];
  };


  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages((p) => {
        const alreadyResponded = p.today.some((m) => m.sender === "exec");
        if (alreadyResponded) {
          setTyping(false);
          return p;
        }
        const initialReply = {
          id: Date.now(),
          sender: "exec",
          text: "Hi Joffre! Thanks for reaching out. How can I help you today?",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setTyping(false);
        return { ...p, today: [...p.today, initialReply] };
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const getSimulatedResponse = (text) => {
    const query = text.toLowerCase();
    if (query.includes("hello") || query.includes("hi") || query.includes("hey")) {
      return "Hello! How can I assist you with your hiring or job search today?";
    }
    if (query.includes("job") || query.includes("post") || query.includes("hiring")) {
      return "To manage your job posts, you can go to the Job Postings section from the sidebar menu. You can edit, close, or boost your active jobs there.";
    }
    if (query.includes("pricing") || query.includes("payment") || query.includes("cost") || query.includes("subscription")) {
      return "We offer flexible pricing options for recruiters. Please visit our pricing page or let me know if you would like me to connect you with our sales representative.";
    }
    if (query.includes("bug") || query.includes("error") || query.includes("not working") || query.includes("issue")) {
      return "I apologize for the inconvenience. Could you please provide more details or screenshots of the issue? I'll escalate this to our technical team immediately.";
    }
    if (query.includes("thank")) {
      return "You're very welcome! If you have any other questions, feel free to ask.";
    }
    return "Thank you for the message. I am looking into this for you and will get back to you shortly. Feel free to add any additional details.";
  };

  const send = () => {
    if (!input.trim()) return;
    const userText = input.trim();
    const newMsg = {
      id: Date.now(),
      sender: "joffre",
      text: userText,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((p) => ({ ...p, today: [...p.today, newMsg] }));
    setInput("");

    setTyping(true);

    setTimeout(() => {
      const execReply = {
        id: Date.now() + 1,
        sender: "exec",
        text: getSimulatedResponse(userText),
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((p) => ({ ...p, today: [...p.today, execReply] }));
      setTyping(false);
    }, 2000);
  };

  const Avatar = ({ src }) => (
    <img
      src={src}
      alt="avatar"
      className="w-7 h-7 rounded-full object-cover shrink-0"
      onError={(e) => {
        e.target.src = "https://randomuser.me/api/portraits/women/44.jpg";
      }}
    />
  );

  const Bubble = ({ msg }) => {
    const isJoffre = msg.sender === "joffre";
    return (
      <div
        className={`flex flex-col ${isJoffre ? "items-end" : "items-start"} gap-1`}
      >
        <div
          className={`max-w-xs px-4 py-3 rounded-2xl text-sm leading-relaxed ${isJoffre ? "bg-amber-50 text-gray-800" : "bg-purple-100 text-gray-800"}`}
        >
          {msg.audioUrl ? (
            <audio controls src={msg.audioUrl} className="max-w-[240px] focus:outline-none" />
          ) : (
            msg.text
          )}
        </div>
        <div
          className={`flex items-center gap-2 text-xs text-gray-400 ${isJoffre ? "flex-row-reverse" : "flex-row"}`}
        >
          <Avatar
            src={
              isJoffre
                ? "https://randomuser.me/api/portraits/men/32.jpg"
                : "https://randomuser.me/api/portraits/women/44.jpg"
            }
          />
          <span>{isJoffre ? "Joffre" : "Executive"}</span>
          <span>{msg.time}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1  w-full mx-auto px-4 py-4 flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={onBack}
            className="text-gray-700 hover:text-purple-600 transition"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Chat Support</h1>
        </div>

        <div className="border border-gray-200 rounded-2xl bg-white flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
            <p className="text-center text-xs text-gray-400">Yesterday</p>
            {messages.yesterday.map((m) => (
              <Bubble key={m.id} msg={m} />
            ))}
            <p className="text-center text-xs text-gray-400 mt-2">Today</p>
            {messages.today.map((m) => (
              <Bubble key={m.id} msg={m} />
            ))}
            {typing && (
              <div className="flex flex-col items-start gap-1">
                <div className="bg-purple-100 px-4 py-3 rounded-2xl text-sm text-gray-600 italic">
                  Typing…
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Avatar src="https://randomuser.me/api/portraits/women/44.jpg" />
                  <span>Executive</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-gray-100 p-4 flex items-center gap-3">
            {isRecording ? (
              <div className="flex-1 flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block shrink-0" />
                  <span className="text-sm text-red-600 font-medium">
                    Recording... {Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, "0")}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={cancelRecording}
                  className="text-gray-400 hover:text-red-500 transition cursor-pointer text-sm font-semibold"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 gap-2">
                <button
                  type="button"
                  onClick={startRecording}
                  className="text-gray-400 hover:text-purple-600 transition shrink-0 cursor-pointer"
                >
                  <Mic size={16} />
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Enter your Message..."
                  className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
                />
                <button
                  type="button"
                  onClick={startRecording}
                  className="text-purple-500 hover:text-purple-700 transition shrink-0 cursor-pointer"
                >
                  <Mic size={16} />
                </button>
              </div>
            )}
            <button
              onClick={isRecording ? stopRecording : send}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition cursor-pointer shrink-0 ${isRecording ? "bg-red-500 hover:bg-red-600 text-white" : "bg-purple-700 hover:bg-purple-800 text-white"
                }`}
            >
              {isRecording ? (
                <div className="w-3.5 h-3.5 bg-white rounded-xs" />
              ) : (
                <Send size={16} />
              )}
            </button>
          </div>
        </div>
      </div>
      <footer className="text-center text-xs text-gray-400 py-4">
        @ 2024 MyJob – Job Portal. All rights Rserved
      </footer>
    </div>
  );
}

// ─── MAIN SETTINGS ───────────────────────────────────────────────────────────

const Settings = () => {
  const [tab, setTab] = useState("general");
  const [chatOpen, setChatOpen] = useState(false);

  if (chatOpen) return <ChatSupport onBack={() => setChatOpen(false)} />;

  return (
    <div className="min-h-screen bg-white flex flex-col shadow-sm">
      <div className="flex-1 w-full mx-auto px-4 py-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-3">Settings</h1>
        <hr className="mb-8 border-gray-300" />
        {/* Tab bar */}
        <div className="flex items-center gap-6 mb-6 border-b border-gray-200 pb-3">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 text-sm font-medium pb-1 transition border-b-2 -mb-3.5 ${tab === key
                ? "text-purple-600 border-purple-600"
                : "text-gray-500 border-transparent hover:text-gray-700"
                }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "general" && <GeneralTab />}
        {tab === "faq" && <FAQTab />}
        {tab === "support" && (
          <SupportTab onChatOpen={() => setChatOpen(true)} />
        )}
        {tab === "terms" && <TermsTab />}
      </div>

      {/* footer */}
      <Footer />
    </div>
  );
};

export default Settings;
