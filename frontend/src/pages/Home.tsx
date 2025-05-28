import { useEffect, useState } from "react";
import { ModeToggle } from "@/components/ModeToggle";
import { Logo } from "@/components/Logo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { WeatherChart } from "@/components/WeatherChart";
import axios from "axios";
import { Separator } from "@/components/ui/separator";
import { Brain, ChartArea } from "lucide-react";
import WeatherAdviceCard from "@/components/WeatherAdviceCard";
import { PrecipitationChart } from "@/components/PrecipitationChart";
import { HumidityChart } from "@/components/HumidityChart";

const citiesObject = {
  Bucuresti: {
    name: "🌆 București",
    value: "bucuresti",
  },
  Cluj: {
    name: "🚞 Cluj",
    value: "cluj",
  },
  Iasi: {
    name: "🏫 Iași",
    value: "iasi",
  },
  Timisoara: {
    name: "🎭 Timișoara",
    value: "timisoara",
  },
  Constanta: {
    name: "🌊 Constanța",
    value: "constanta",
  },
};

const cities = Object.values(citiesObject);

type WeatherData = {
  date: string;
  temp_min: number;
  temp_max: number;
  precipitation: number;
  humidity_min: number;
  humidity_max: number;
};

export default function CityTabsCard() {
  const [selectedCity, setSelectedCity] = useState("bucuresti");
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [chartType, setChartType] = useState<
    "temperature" | "precipitation" | "humidity"
  >("temperature");

  useEffect(() => {
    setWeatherData([]);
    setAiAdvice(null);
    setLoading(true);

    axios
      .get(`http://localhost:8000/weather?city=${selectedCity}`)
      .then((res) => {
        setWeatherData(res.data.data);
      })
      .catch((err) => {
        console.error("Eroare la fetch meteo:", err);
        setWeatherData([]);
      })
      .finally(() => setLoading(false));

    axios
      .get(`http://localhost:8000/weather/ai-advice?city=${selectedCity}`)
      .then((res) => {
        setAiAdvice(res.data.advice);
      })
      .catch((err) => {
        console.error("Eroare la fetch AI advice:", err);
        setAiAdvice(null);
      });
  }, [selectedCity]);

  return (
    <>
      <ModeToggle />
      <Logo />
      <Card className="m-8 mt-20 h-[85vh]">
        <CardHeader>
          <CardTitle className="text-lg">Selectează un oraș</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedCity} onValueChange={setSelectedCity}>
            <TabsList className="grid w-full grid-cols-5">
              {cities.map((city) => (
                <TabsTrigger key={city.value} value={city.value}>
                  {city.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {cities.map((city) => (
              <TabsContent key={city.value} value={city.value} className="mt-4">
                <div className="flex h-full">
                  <div className="flex flex-col w-[70%] mr-4 -ml-10">
                    <h1 className="flex font-bold ml-10 mb-4">
                      <ChartArea size={20} className="mr-2" />
                      Chart
                    </h1>
                    {loading ? (
                      <p className="text-muted-foreground ml-10">
                        Se încarcă datele meteo...
                      </p>
                    ) : (
                      <>
                        {chartType === "temperature" && (
                          <WeatherChart data={weatherData} />
                        )}
                        {chartType === "precipitation" && (
                          <PrecipitationChart data={weatherData} />
                        )}
                        {chartType === "humidity" && (
                          <HumidityChart data={weatherData} />
                        )}
                      </>
                    )}
                  </div>
                  <Separator orientation="vertical" className="" />
                  <div className="w-[30%]">
                    <h1 className="flex font-bold mb-4 mt-2">
                      <Brain size={20} className="mr-2" />
                      Recomandări AI
                    </h1>
                    <p className="text-muted-foreground">
                      {city.name} - {new Date().toLocaleDateString("ro-RO")}
                    </p>
                    <div className="mt-4">
                      {aiAdvice ? (
                        <WeatherAdviceCard advice={aiAdvice} />
                      ) : (
                        <p className="text-muted-foreground ml-2">
                          {loading && "Se generează recomandările..."}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <Tabs
                  defaultValue="temperature"
                  value={chartType}
                  onValueChange={(v) => setChartType(v as any)}
                  className="absolute w-[90%] bottom-20 left-15"
                >
                  <TabsList>
                    <TabsTrigger value="temperature">
                      🌡️ Temperatură
                    </TabsTrigger>
                    <TabsTrigger value="precipitation">
                      🌧️ Precipitații
                    </TabsTrigger>
                    <TabsTrigger value="humidity">💧 Umiditate</TabsTrigger>
                  </TabsList>
                </Tabs>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
}
