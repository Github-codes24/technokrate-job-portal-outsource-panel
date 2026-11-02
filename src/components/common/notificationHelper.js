const initialNotifications = [
  {
    id: 1,
    title: "New Roles Added",
    message: "2 new roles added.",
    details: "The new roles added are Senior Frontend Developer and Backend Engineer. They have been posted in the IT department.",
    time: "Today 6:30 AM",
    bg: "bg-green-50",
    isRead: false,
  },
  {
    id: 2,
    title: "Mail Received",
    message: "1 new mail received .",
    details: "You received an email from John Doe regarding the recent candidate interview feedback.",
    time: "Today 6:30 AM",
    bg: "bg-red-50",
    isRead: false,
  },
  {
    id: 3,
    title: "New Database Added",
    message: "1 new database added",
    details: "The new MongoDB cluster has been successfully provisioned and linked to the Jobseeker portal.",
    time: "Today 6:30 AM",
    bg: "bg-green-50",
    isRead: true,
  },
  {
    id: 4,
    title: "Calls Received",
    message: "4 new calls received .",
    details: "Missed calls from 4 different candidates inquiring about their application status.",
    time: "Today 6:30 AM",
    bg: "bg-red-50",
    isRead: true,
  },
];

const formatTime = () => {
  const date = new Date();
  let hours = date.getHours();
  let minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  return `Today ${hours}:${minutes} ${ampm}`;
};

export const addNotification = (title, message, details, bg = "bg-purple-50") => {
  try {
    const stored = localStorage.getItem("userNotifications");
    let notifications = [];
    if (stored) {
      notifications = JSON.parse(stored);
    } else {
      notifications = [...initialNotifications];
    }

    const newNotification = {
      id: Date.now(),
      title,
      message,
      details,
      time: formatTime(),
      bg,
      isRead: false,
    };

    notifications.unshift(newNotification);
    localStorage.setItem("userNotifications", JSON.stringify(notifications));
    window.dispatchEvent(new Event("notificationsUpdate"));
  } catch (e) {
    console.error("Failed to add notification to localStorage", e);
  }
};
