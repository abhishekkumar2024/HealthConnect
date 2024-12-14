import { FirstDivClass, CardDivClass} from "../utilities/className";
import { Button } from "../utilities/Button";
const Login = ({color='bg-blue-50', BackGroundCardColor='bg-blue-50'}) => {
  return (
    <div className={ FirstDivClass }>
      <div className={ CardDivClass }>
        <h1 className="text-blue-950 text-center font-semibold text-2xl my-4">
          Log in to HealthConnect
        </h1>
        <div className="flex-col justify-between items-center w-full space-y-4">
          <div className="flex justify-center items-center">
            <input
              type="text"
              placeholder="Username or Email ID"
              className="
                placeholder-blue-900
                rounded-sm
                ring-1 
                ring-slate-700
                bg-transparent
                text-black
                px-3
                py-2
                w-full
              "
            />
          </div>
          <div className="flex justify-center items-center">
            <input
              type="password"
              placeholder="Password"
              className="
                placeholder-blue-900
                rounded-sm
                ring-1 
                ring-slate-700
                bg-transparent
                text-black
                px-3
                py-2
                w-full
              "
            />
          </div>
          < Button name="Login"/>
        </div>  
        <div className="flex w-full justify-between items-center mt-6">
          <div className="flex items-center space-x-2">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-400"
              />
              <span className="text-sm text-blue-950 ml-2">Remember Me</span>
            </label>
          </div>
          <div>
            <a
              href="#"
              className="
              text-blue-600 
              hover:underline 
              hover:text-blue-800"
            >
              Forgot Password?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Login };
