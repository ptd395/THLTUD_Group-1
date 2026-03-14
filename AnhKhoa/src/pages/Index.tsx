import { useNavigate } from "react-router-dom";
import { ArrowLeft, BarChart3, MessageSquare, SmilePlus } from "lucide-react";
import { Card } from "@/components/ui/card";

const dashboards = [
  {
    title: "Agent KPI Dashboard",
    description: "Theo dõi hiệu suất, SLA và cảm xúc khách hàng",
    icon: BarChart3,
    path: "/dashboard/kpi",
  },
  {
    title: "Multi-channel Sentiment",
    description: "Phân tích cảm xúc theo từng kênh liên lạc",
    icon: MessageSquare,
    path: "/dashboard/channel",
  },
  {
    title: "Sentiment Analysis",
    description: "Phân tích chi tiết theo khía cạnh và từ khóa",
    icon: SmilePlus,
    path: "/dashboard/sentiment",
  },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-3xl">
        <button
          onClick={() => navigate("/")}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-accent transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Customer Care Dashboard
        </h1>
        <p className="text-muted-foreground mb-8">
          Chọn dashboard bạn muốn xem
        </p>

        <div className="grid gap-4">
          {dashboards.map((d) => (
            <Card
              key={d.path}
              className="p-6 cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all group"
              onClick={() => navigate(d.path)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <d.icon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">{d.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {d.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
