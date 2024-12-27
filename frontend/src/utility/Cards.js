const FirstTitleCard = ({childern})=>{
    return (
        <div className="flex flex-col justify-center items-center space-y-7 ">
            <h3 className="font-bold text-2xl">
               Hello Good afterNoon, WellCome to HealthConnect
            </h3>
            <p1 className="bg-zinc-700 text-wrap px-6 py-9 w-1/2 text-xl rounded-lg shadow-xl">
                your all-in-one healthcare companion! <span className=" px-1 bg-slate-600 border-1 rounded-md"> <a href="">Streamline appointments</a> </span>, manage medical records securely, and connect with top-rated doctors—all from one intuitive platform. Experience the future of healthcare, where care meets convenience, and your health is always in your hands.</p1>
        </div>
    );
}
export {FirstTitleCard}