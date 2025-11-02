import { Card, CardHeader, CardTitle, CardContent } from "../utils/cards/Card";
import { Calendar, Clock, Plus, User, MessageSquare, Phone } from "lucide-react";
import { useDarkMode } from "../contextAPI/contextApi";

const AppointmentsPage = () => {
  const { themeStyles } = useDarkMode();

  const appointments = [
  ];

  return (
    <div className={`p-6 max-w-6xl mx-auto space-y-6 ${themeStyles.bg} ${themeStyles.text}`}>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Appointments</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className={`${themeStyles.cardBg} ${themeStyles.border} border`}>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className={`${themeStyles.accentBg} p-4 rounded-lg space-y-2`}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{apt.title}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        apt.status === "upcoming"
                          ? "bg-green-100 text-green-800"
                          : ""
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>
                  <div className="text-sm">
                    <p className="flex items-center gap-2">
                      <User size={16} /> {apt.doctor} - {apt.specialty}
                    </p>
                    <p className="flex items-center gap-2">
                      <Calendar size={16} /> {apt.date}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock size={16} /> {apt.time}
                    </p>
                  </div>
                  <div className="flex gap-4 mt-2">
                    <button
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${themeStyles.buttonBg} ${themeStyles.buttonHoverBg} text-white`}
                    >
                      <MessageSquare size={16} /> Chat
                    </button>
                    <button
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${themeStyles.buttonBg} ${themeStyles.buttonHoverBg} text-white`}
                    >
                      <Phone size={16} /> Call
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className={`${themeStyles.cardBg} ${themeStyles.border} border`}>
          <CardHeader>
            <CardTitle className="text-lg">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className={`${themeStyles.accentBg} p-4 rounded-lg`}>
                <p className="text-sm">Total Appointments</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <div className={`${themeStyles.accentBg} p-4 rounded-lg`}>
                <p className="text-sm">Upcoming</p>
                <p className="text-2xl font-bold">2</p>
              </div>
              <div className={`${themeStyles.accentBg} p-4 rounded-lg`}>
                <p className="text-sm">Completed</p>
                <p className="text-2xl font-bold">18</p>
              </div>
              <div className={`${themeStyles.accentBg} p-4 rounded-lg`}>
                <p className="text-sm">Cancelled</p>
                <p className="text-2xl font-bold">4</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export { AppointmentsPage };
