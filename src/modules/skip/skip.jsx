import React from "react"
import { useNavigate } from "react-router-dom";
import backarrow from "../../assets/img/ep_back.png";

const Skip = ({ onBack }) => {
    const navigate = useNavigate();
    const handleClick = () => {
        if (onBack) {
            onBack();       // Stepper page me custom logic
        } else {
            navigate(-1);   // Dusre pages me normal back
        }
    };
    return (
        <>
            <div className="absolute left-5 top-1 z-[100] cursor-pointer">
                <button onClick={handleClick} className="text-2xl">
                    <img src={backarrow} className="w-[25px] h-[25px]" />
                </button>
            </div>
        </>
    )
}
export default Skip;