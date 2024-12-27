const img=require('../assests/Doctor_img1.jpeg')

const DoctorCard = ({DoctorName="Rahul"})=>
{
    return (
        <div className="bg-slate-400 text-slate-600 flex-row w-80 h-80 rounded-2xl">
            <img className=" w-70 h-60 px-4 py-4 rounded-3xl" src={img} alt="" />
            <div className="flex-col">
                <label htmlFor="
                " name="Doctor" className="text-xl p-4">Name : {DoctorName}</label>
            </div>
        </div>
    )
}
export {DoctorCard}