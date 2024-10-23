// import ไลบรารีต่างๆ
import { useState, useEffect } from "react";
import Icon from "react-icons-kit";
import { search } from "react-icons-kit/feather/search";
import { arrowUp } from "react-icons-kit/feather/arrowUp";
import { arrowDown } from "react-icons-kit/feather/arrowDown";
import { droplet } from "react-icons-kit/feather/droplet";
import { wind } from "react-icons-kit/feather/wind";
import { activity } from "react-icons-kit/feather/activity";
import { useDispatch, useSelector } from "react-redux";
import { get5DaysForecast, getCityData } from "./Store/Slices/WeatherSlices";
import { SphereSpinner } from "react-spinners-kit";




function App() {
  // ดึงข้อมูลสถานะจาก Redux Store
  const {
    citySearchLoading, // แสดงว่ากำลังค้นหาข้อมูลเมืองอยู่หรือไม่
    citySearchData,
    forecastLoading, // แสดงว่ากำลังดึงข้อมูลพยากรณ์อากาศอยู่หรือไม่
    forecastData, // ข้อมูลพยากรณ์อากาศที่ได้จาก API
    forecastError, // ข้อผิดพลาดที่เกิดขึ้น (ถ้ามี)
  } = useSelector((state) => state.weather); // ดึงสถานะจาก Redux store ที่เกี่ยวกับการค้นหาเมืองและพยากรณ์อากาศ

  // การจัดการสถานะการโหลด
  const [loadings, setLoadings] = useState(true); //เก็บสถานะว่ากำลังโหลดข้อมูลอยู่หรือไม่ (true/false)


  const allLoadings = [citySearchLoading, forecastLoading];
  useEffect(() => { // ใช้ useEffect เพื่อคอยเช็คทุกครั้งที่สถานะการโหลด (allLoadings) เปลี่ยนแปลง ถ้ามีสถานะใดสถานะหนึ่งเป็น true ก็จะตั้งค่า loadings เป็น true
    const isAnyChildLoading = allLoadings.some((state) => state);
    setLoadings(isAnyChildLoading);
  }, [allLoadings]);

  // จัดการสถานะเมือง
  const [city, setCity] = useState('ชลบุรี'); // city - เก็บชื่อเมือง (เริ่มต้นที่ 'Pattaya') , setCity - สำหรับเปลี่ยนค่าเมือง
  
  // จัดการหน่วยของอุณหภูมิ
  const [unit, setUnit] = useState("metric"); // metric = C and imperial = F


  // toggle unit
  const toggleUnit = () => { // ฟังก์ชัน toggleUnit สลับหน่วยอุณหภูมิระหว่างเซลเซียส (metric) กับฟาเรนไฮต์ (imperial)
    setLoadings(true);
    setUnit(unit === "metric" ? "imperial" : "metric");
  };

  // ฟังก์ชันดึงข้อมูลจาก API
  const dispatch = useDispatch(); // useDispatch ใช้เรียกฟังก์ชัน dispatch เพื่อส่งคำสั่งไปยัง Redux

  // fetch data
  const fetchData = () => { // ฟังก์ชัน fetchData ดึงข้อมูลเมือง (getCityData) โดยใช้ค่าเมือง (city) และหน่วย (unit) 
    dispatch( // จากนั้น ถ้าไม่มีข้อผิดพลาด จะดึงพยากรณ์อากาศ 5 วัน (get5DaysForecast) ด้วยพิกัด lat และ lon
      getCityData({
        city,
        unit,
      })
    ).then((res) => {
      if (!res.payload.error) {
        dispatch(
          get5DaysForecast({
            lat: res.payload.data.coord.lat,
            lon: res.payload.data.coord.lon,
            unit,
          })
        );
      }
    });
  };

  // การเรียกใช้ fetchData เมื่อหน่วยเปลี่ยน
  useEffect(() => { // ใช้ useEffect เพื่อดึงข้อมูลใหม่ทุกครั้งที่หน่วยอุณหภูมิ (unit) เปลี่ยน
    fetchData();
  }, [unit]);

  // การค้นหาเมือง
  const handleCitySearch = (e) => { // ฟังก์ชัน handleCitySearch ใช้ในการค้นหาเมืองใหม่ โดยเรียก fetchData และป้องกันการรีเฟรชหน้าโดยใช้ e.preventDefault()
    e.preventDefault();
    setLoadings(true);
    fetchData();
  };

  // การกรองข้อมูลพยากรณ์อากาศ
  const filterForecastByFirstObjTime = (forecastData) => { // ฟังก์ชันนี้กรองข้อมูลพยากรณ์อากาศให้แสดงเฉพาะเวลาเดียวกันของวัน โดยดูจากข้อมูลพยากรณ์ตัวแรก
    if (!forecastData) {
      return [];
    }

    const firstObjTime = forecastData[0].dt_txt.split(" ")[1];
    return forecastData.filter((data) => data.dt_txt.endsWith(firstObjTime));
  };



  // ผลลัพธ์ข้อมูลพยากรณ์ที่กรองแล้ว
  const filteredForecast = filterForecastByFirstObjTime(forecastData?.list); // filteredForecast เก็บข้อมูลพยากรณ์อากาศที่ถูกกรองแล้ว

  return (
    <div className="background">
      <div className="box">
        {/* city search form */} 
        <form autoComplete="off" onSubmit={handleCitySearch}>  
          <label>
            <Icon icon={search} size={20} />
          </label>
          <input
            type="text"
            className="city-input"
            placeholder="กรอกข้อมูล"
            required
            value={city}
            onChange={(e) => setCity(e.target.value)} // onChange ใช้สำหรับอัปเดตค่า city เมื่อผู้ใช้พิมพ์ชื่อเมืองใหม่
            readOnly={loadings}
          />
          <button type="submit">ค้นหา</button>
        </form>

        
        


        {/* current weather details box */}
        <div className="current-weather-details-box">
          {/* header */}
          <div className="details-box-header">
            {/* heading */}
            <h4>สภาพอากาศปัจจุบัน</h4>

            {/* switch */}
            <div className="switch" onClick={toggleUnit}>
              <div
                className={`switch-toggle ${unit === "metric" ? "c" : "f"}`}
              ></div>
              <span className="c">C</span>
              <span className="f">F</span>
            </div>
          </div>

          {loadings ? ( // การแสดงสถานะการโหลด
            <div className="loader"> 
              <SphereSpinner loadings={loadings} color="#2fa5ed" size={20} /> 
            </div> // ส่วนนี้แสดงการโหลดข้อมูลด้วย SphereSpinner ถ้ายังมีการโหลดข้อมูลอยู่ (loadings === true)
          ) : (
            <>
              {citySearchData && citySearchData.error ? (
                <div className="error-msg">{citySearchData.error}</div> // ถ้าข้อมูลมีข้อผิดพลาด จะแสดงข้อความแสดงข้อผิดพลาด (error-msg)
              ) : (
                <>
                  {forecastError ? (
                    <div className="error-msg">{forecastError}</div>
                  ) : (
                    <>
                      {citySearchData && citySearchData.data ? (
                        //การแสดงผลข้อมูลสภาพอากาศ
                        <div className="weather-details-container">
                          <div className="details">
                            <h4 className="city-name">
                              {citySearchData.data.name}
                            </h4>

                            <div className="icon-and-temp">
                              <img
                                src={`https://openweathermap.org/img/wn/${citySearchData.data.weather[0].icon}@2x.png`}
                                alt="icon"
                              />
                              <h1>{citySearchData.data.main.temp}&deg;</h1>
                            </div>

                            <h4 className="description">
                              {citySearchData.data.weather[0].description}
                            </h4>
                          </div>

                          {/* metrices */}
                          <div className="metrices">
                            {/* feels like */}
                            <h4>
                              อุณหภูมิ {citySearchData.data.main.feels_like}
                              &deg;C
                            </h4>

                            {/* min max temp */}
                            <div className="key-value-box">
                              <div className="key">
                                <Icon
                                  icon={arrowUp}
                                  size={20}
                                  className="icon"
                                />
                                <span className="value">
                                  {citySearchData.data.main.temp_max}
                                  &deg;C
                                </span>
                              </div>
                              <div className="key">
                                <Icon
                                  icon={arrowDown}
                                  size={20}
                                  className="icon"
                                />
                                <span className="value">
                                  {citySearchData.data.main.temp_min}
                                  &deg;C
                                </span>
                              </div>
                            </div>

                            {/* humidity */}
                            <div className="key-value-box">
                              <div className="key">
                                <Icon
                                  icon={droplet}
                                  size={20}
                                  className="icon"
                                />
                                <span>ความชื้น</span>
                              </div>
                              <div className="value">
                                <span>
                                  {citySearchData.data.main.humidity}%
                                </span>
                              </div>
                            </div>

                            {/* wind */}
                            <div className="key-value-box">
                              <div className="key">
                                <Icon icon={wind} size={20} className="icon" />
                                <span>ลม</span>
                              </div>
                              <div className="value">
                                <span>{citySearchData.data.wind.speed}kph</span>
                              </div>
                            </div>

                            {/* pressure */}
                            <div className="key-value-box">
                              <div className="key">
                                <Icon
                                  icon={activity}
                                  size={20}
                                  className="icon"
                                />
                                <span>ความดัน</span>
                              </div>
                              <div className="value">
                                <span>
                                  {citySearchData.data.main.pressure}
                                  hPa
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="error-msg">ไม่พบข้อมูล</div>
                      )}
                      {/* extended forecastData */}
                      <h4 className="extended-forecast-heading">
                        พยากรณ์ 5 วัน ล่วงหน้า
                      </h4>
                      {filteredForecast.length > 0 ? (
                        <div className="extended-forecasts-container">
                          {filteredForecast.map((data, index) => { // แสดงข้อมูลพยากรณ์อากาศ 5 วัน โดยใช้ฟังก์ชัน filteredForecast ซึ่งกรองข้อมูลที่ได้จาก API
                            const date = new Date(data.dt_txt);
                            const day = date.toLocaleDateString("th", {weekday: "long",});
                            return (
                              <div className="forecast-box" key={index}>
                                <h5>{day}</h5>
                                <img src={`https://openweathermap.org/img/wn/${data.weather[0].icon}.png`} alt="icon"/>
                                <h5>{data.weather[0].description}</h5>
                                <h5 className="min-max-temp">
                                  {data.main.temp_max}&deg; /{" "}
                                  {data.main.temp_min}&deg;
                                </h5>
                              </div>

                              
                            );
                          })}
                        </div>
                      ) : (
                        <div className="error-msg">ไม่พบข้อมูล</div>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
      
    </div>
  );
}

export default App;