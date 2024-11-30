import { FirstTitleCard } from "../utility/Cards";

const FirstUI = () => {
    return (
        <div className="mx-7 my-3 flex flex-col w-auto justify-center items-center">
            <FirstTitleCard />

            {/* Search Input */}
            <label className="relative block w-1/2 mt-3 bg-slate-700 rounded-lg shodow-xl">
                <span className="sr-only">Search</span>
                <span className="absolute inset-y-0 left-0 flex items-center pl-2">
                    <svg 
                        className="h-5 w-5 fill-transparent" 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        strokeWidth="2" 
                        stroke="currentColor">
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            d="M10 4a6 6 0 016 6c0 1.5-.5 2.9-1.4 4l4.3 4.3a1 1 0 01-1.4 1.4l-4.3-4.3c-1.1.9-2.5 1.4-4 1.4a6 6 0 110-12z" 
                        />
                    </svg>
                </span>
                <input 
                    className="placeholder:italic placeholder:text-slate-400 block bg-transparent w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-xl focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm" 
                    placeholder="Search for anything..." 
                    type="text" 
                    name="search" 
                />
            </label>
        </div>
    );
};

export { FirstUI };
