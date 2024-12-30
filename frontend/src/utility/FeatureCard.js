import { ArrowRight } from "lucide-react"
const FeatureCard = ({ icon: Icon, title, description}) => {
    return (
        <div className="bg-slate-600 flex-col w-80 h-80 mx-4 rounded-2xl flex justify-center text-center items-center">
            <Icon className="px-3 py-4 text-blue-600" size={90} />
            <h3 className="font-semibold mb-2 text-white">{title}</h3>
            <p className="text-center text-sm text-white px-4">
                {description}
            </p>
            <button className="border-blue-600 border-2 w-32 rounded-2xl items-center mt-5 hover:bg-slate-900">
                <ArrowRight  className="justify-between mx-14 my-1/2 items-center"size={24} />
            </button>
        </div>
    )
}
export { FeatureCard }