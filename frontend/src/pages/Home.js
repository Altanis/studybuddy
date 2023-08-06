import Navbar from "../components/Navbar";
import Info from "../components/Info";
import StudyConquering from "../assets/images/nerd.svg";

import { UserAuth } from "../context/AuthContext";
import { useSearchParams } from "react-router-dom";
import ErrorMessage from "../components/ErrorMessage";
import { UseCookie } from "../context/CookieContext";

export default function Home() {
    let { user, signIn } = UserAuth();
    const { getCookie } = UseCookie();
    
    const [searchParams] = useSearchParams();

    let message = "";
    switch (searchParams.get("error"))
    {
        case "1": message = "An error occurred while signing in. Please try again."; break;
        case "2": message = "An error occurred while authorizing you. Please try again."; break;
        default: break;
    };

    return (
        <div className="relative">
            <Navbar />
            {message && (<ErrorMessage message={message} />)}
            <div className="flex flex-row px-[10%] p-12 pb-[0%]">
                <div className="w-2/5 h-1/5 text-white">
                    <h1 className="text-5xl font-bold text-blurple pb-5">Learn Smarter for Your Exams</h1>
                    <p className="text-md pb-10">Accelerate your learning by using the only study tool you will ever need.</p>
                    <button 
                        className="transition text-black ease-in-out delay-50 bg-button hover:scale-110 hover:bg-button-hover duration-300 p-3 rounded-lg font-semibold mt-4" 
                        onClick={async () => !["{}", "null"].includes(JSON.stringify(user)) ? (window.location.href = `/profile/${getCookie("id")}`) : (await signIn())}
                    >
                        {!["{}", "null"].includes(JSON.stringify(user)) ? "Go to Profile" : "Get Started"}
                    </button>
                    <div className="pt-[10%]">
                        <Info 
                            icon="fa-solid fa-key fa-2x text-orange-400"
                            header="Unlock your potential." 
                            paragraph="Input a topic and difficulty level, and we will generate questions to test your knowledge. You will receive instant feedback on your answers." 
                        />
                        
                        <Info
                            icon="fa-solid fa-repeat fa-2x text-green-400" 
                            header="Stand out from your peers." 
                            paragraph="Our app utilizes AI powered tools to efficiently curate itself to your needs for effectiveness and efficiency." 
                        />

                        <Info
                            icon="fa-solid fa-graduation-cap fa-2x text-blue-600 w-8"
                            header="Learn smarter, not harder."
                            paragraph="Our app is designed to help you learn more in less time, so you can spend more time doing what you love."
                        />

                        <Info 
                            icon="fa-solid fa-heart fa-2x text-red-600" 
                            header="Have a blast while learning!" 
                            paragraph="Our app is designed to be fun and engaging, so you can enjoy the learning process."
                        />
                    </div>
                </div>
                <div className="w-3/5 flex justify-end">
                    <img className="" src={StudyConquering} alt="Home" width={600} height={600} />
                </div>
            </div>
        </div>
    )
};