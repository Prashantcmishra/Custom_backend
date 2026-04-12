import { sendSuccess } from "../utils/response.js";

// ─────────────────────────────────────────────────────────────────────────────
//  EMPLOYEE LIST
//  GET /api/employees
//  Header: Authorization: Bearer <accessToken>   ← required
//
//  Frontend use case:
//    HomeScreen mounts → call this with the stored accessToken.
//    If 403 returned → call /api/auth/refresh → retry with new accessToken.
// ─────────────────────────────────────────────────────────────────────────────

const EMPLOYEES = [
  { id: 1,  name: "Prashant Mishra", email: "prashant@gmail.com", role: "Frontend Developer",   experience: "1 year",   skills: ["React", "React Native", "JavaScript"], location: "Lucknow",   isActive: true,  salary: 400000,  joiningDate: "2024-06-01", profileImage: "https://i.pravatar.cc/150?img=1" },
  { id: 2,  name: "Rahul Sharma",    email: "rahul@gmail.com",    role: "Backend Developer",    experience: "2 years",  skills: ["Node.js", "MongoDB"],                  location: "Delhi",     isActive: false, salary: 600000,  joiningDate: "2023-01-15", profileImage: "https://i.pravatar.cc/150?img=2" },
  { id: 3,  name: "Amit Singh",      email: "amit@gmail.com",     role: "Full Stack Developer", experience: "3 years",  skills: ["MERN", "Docker"],                      location: "Bangalore", isActive: true,  salary: 800000,  joiningDate: "2022-03-10", profileImage: "https://i.pravatar.cc/150?img=3" },
  { id: 4,  name: "Neha Verma",      email: "neha@gmail.com",     role: "Frontend Developer",   experience: "2 years",  skills: ["React", "Redux"],                      location: "Noida",     isActive: true,  salary: 550000,  joiningDate: "2023-05-20", profileImage: "https://i.pravatar.cc/150?img=4" },
  { id: 5,  name: "Rohit Kumar",     email: "rohit@gmail.com",    role: "Backend Developer",    experience: "1.5 years",skills: ["Express", "MongoDB"],                  location: "Patna",     isActive: false, salary: 450000,  joiningDate: "2023-09-12", profileImage: "https://i.pravatar.cc/150?img=5" },
  { id: 6,  name: "Sneha Gupta",     email: "sneha@gmail.com",    role: "Full Stack Developer", experience: "4 years",  skills: ["MERN", "AWS"],                         location: "Pune",      isActive: true,  salary: 900000,  joiningDate: "2021-11-01", profileImage: "https://i.pravatar.cc/150?img=6" },
  { id: 7,  name: "Arjun Yadav",     email: "arjun@gmail.com",    role: "Frontend Developer",   experience: "1 year",   skills: ["HTML", "CSS", "JS"],                   location: "Lucknow",   isActive: true,  salary: 350000,  joiningDate: "2024-01-10", profileImage: "https://i.pravatar.cc/150?img=7" },
  { id: 8,  name: "Karan Mehta",     email: "karan@gmail.com",    role: "Backend Developer",    experience: "3 years",  skills: ["Node.js", "SQL"],                      location: "Mumbai",    isActive: true,  salary: 750000,  joiningDate: "2022-02-18", profileImage: "https://i.pravatar.cc/150?img=8" },
  { id: 9,  name: "Pooja Singh",     email: "pooja@gmail.com",    role: "Frontend Developer",   experience: "2.5 years",skills: ["React", "Next.js"],                    location: "Delhi",     isActive: true,  salary: 650000,  joiningDate: "2022-08-25", profileImage: "https://i.pravatar.cc/150?img=9" },
  { id: 10, name: "Vikas Pandey",    email: "vikas@gmail.com",    role: "Full Stack Developer", experience: "5 years",  skills: ["MERN", "Docker", "Kubernetes"],        location: "Hyderabad", isActive: false, salary: 1200000, joiningDate: "2020-06-30", profileImage: "https://i.pravatar.cc/150?img=10" },
  { id: 11, name: "Anjali Tiwari",   email: "anjali@gmail.com",   role: "Frontend Developer",   experience: "1 year",   skills: ["React Native", "JS"],                  location: "Lucknow",   isActive: true,  salary: 380000,  joiningDate: "2024-02-01", profileImage: "https://i.pravatar.cc/150?img=11" },
  { id: 12, name: "Manish Kumar",    email: "manish@gmail.com",   role: "Backend Developer",    experience: "2 years",  skills: ["Node.js", "Express"],                  location: "Kanpur",    isActive: true,  salary: 500000,  joiningDate: "2023-03-14", profileImage: "https://i.pravatar.cc/150?img=12" },
  { id: 13, name: "Deepak Yadav",    email: "deepak@gmail.com",   role: "Full Stack Developer", experience: "3 years",  skills: ["MERN"],                                location: "Jaipur",    isActive: false, salary: 700000,  joiningDate: "2022-07-07", profileImage: "https://i.pravatar.cc/150?img=13" },
  { id: 14, name: "Priya Sharma",    email: "priya@gmail.com",    role: "Frontend Developer",   experience: "2 years",  skills: ["React", "Tailwind"],                   location: "Chandigarh",isActive: true,  salary: 600000,  joiningDate: "2023-04-19", profileImage: "https://i.pravatar.cc/150?img=14" },
  { id: 15, name: "Saurabh Singh",   email: "saurabh@gmail.com",  role: "Backend Developer",    experience: "4 years",  skills: ["Node.js", "MongoDB"],                  location: "Indore",    isActive: true,  salary: 850000,  joiningDate: "2021-09-09", profileImage: "https://i.pravatar.cc/150?img=15" },
  { id: 16, name: "Ritika Kapoor",   email: "ritika@gmail.com",   role: "Full Stack Developer", experience: "3.5 years",skills: ["MERN", "AWS"],                         location: "Delhi",     isActive: true,  salary: 780000,  joiningDate: "2022-01-11", profileImage: "https://i.pravatar.cc/150?img=16" },
  { id: 17, name: "Nikhil Verma",    email: "nikhil@gmail.com",   role: "Frontend Developer",   experience: "1.5 years",skills: ["React", "JS"],                         location: "Noida",     isActive: false, salary: 420000,  joiningDate: "2023-10-05", profileImage: "https://i.pravatar.cc/150?img=17" },
  { id: 18, name: "Akash Mishra",    email: "akash@gmail.com",    role: "Backend Developer",    experience: "2.5 years",skills: ["Express", "SQL"],                      location: "Varanasi",  isActive: true,  salary: 580000,  joiningDate: "2022-12-22", profileImage: "https://i.pravatar.cc/150?img=18" },
  { id: 19, name: "Simran Kaur",     email: "simran@gmail.com",   role: "Frontend Developer",   experience: "3 years",  skills: ["React", "Next.js"],                    location: "Amritsar",  isActive: true,  salary: 720000,  joiningDate: "2022-06-06", profileImage: "https://i.pravatar.cc/150?img=19" },
  { id: 20, name: "Yash Gupta",      email: "yash@gmail.com",     role: "Full Stack Developer", experience: "2 years",  skills: ["MERN"],                                location: "Bhopal",    isActive: true,  salary: 620000,  joiningDate: "2023-02-28", profileImage: "https://i.pravatar.cc/150?img=20" },
];

export const getEmployees = (_req, res) => {
  return sendSuccess(res, {
    message: "Employees fetched successfully.",
    data: {
      total: EMPLOYEES.length,
      employees: EMPLOYEES,
    },
  });
};