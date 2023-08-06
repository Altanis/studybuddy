export default function ErrorMessage({ message })
{
    return (
        <div className={`flex justify-center items-center w-screen`}>
            <div className="bg-[#160B0B] border border-[#f8717160] text-red-700 px-4 py-3 rounded relative w-[30%] my-4" role="alert">
                <span className="text-center block">{message}</span>
            </div>
        </div>  
    );
};