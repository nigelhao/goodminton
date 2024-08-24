import React, { useState, useEffect, useRef } from "react";
import "./App.css";

import "@coreui/coreui-pro/dist/css/coreui.min.css";

import {
    CCol,
    CContainer,
    CDatePicker,
    CProgress,
    CRow,
} from "@coreui/react-pro";

interface Slot {
    time: string;
    start: string;
    end: string;
}

interface Court {
    [courtName: string]: Slot[];
}

interface Location {
    location: string;
    slots: Court | null;
}

const App: React.FC = () => {
    const [courts, setCourts] = useState<Location[]>([]);
    const [progressCount, setProgressCount] = useState(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const hasFetchedData = useRef(false);
    const [date, setDate] = useState<Date | null>(null);
    const [displayedDate, setDisplayedDate] = useState("");

    const formatDate = (date: Date) => {
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    };

    const fetchData = async () => {
        let allCourts: Location[] = [];
        let tmpDate = date;
        setDisplayedDate(formatDate(tmpDate as Date));
        for (let i = 0; i < 9; i++) {
            try {
                setProgressCount((prev) => prev + 11);

                const response = await fetch(
                    `https://5dx21kdnv9.execute-api.ap-southeast-1.amazonaws.com/default/goodminton/${i}?date=${formatDate(
                        tmpDate as Date
                    )}`
                );
                const data: Location[] = await response.json();

                allCourts = [...allCourts, ...data];
                await new Promise((resolve) => setTimeout(resolve, 2000));
            } catch (error) {
                console.error(error);
            }
        }
        setDate(null);
        setProgressCount(100);
        setCourts(allCourts);

        setIsLoading(false);
    };

    return (
        <div className="App">
            <CContainer fluid className="my-5">
                <CRow>
                    <CCol>
                        <h1 className="text-center">
                            <strong>Goodminton</strong>
                        </h1>
                    </CCol>
                </CRow>
                <CRow>
                    <CCol>
                        <h4 className="text-center">
                            OnePA Badminton Courts Scouter
                        </h4>
                    </CCol>
                </CRow>
                {!isLoading ? (
                    <CRow>
                        <CCol sm={8}>
                            <CDatePicker
                                className="w-100 mt-3"
                                onDateChange={(e) => {
                                    setDate(e);
                                }}
                                minDate={
                                    new Date(
                                        new Date().setDate(
                                            new Date().getDate() - 1
                                        )
                                    )
                                }
                            />
                        </CCol>
                        <CCol sm={4}>
                            <button
                                disabled={!date}
                                type="button"
                                className="btn btn-danger w-100 mt-3"
                                onClick={() => {
                                    setProgressCount(0);
                                    setIsLoading(true);
                                    fetchData();
                                }}
                            >
                                <strong>{"UNFUCK THIS :)"}</strong>
                            </button>
                        </CCol>
                    </CRow>
                ) : (
                    <CRow>
                        <CCol xs={11}>
                            <CProgress
                                className="w-100 mt-3"
                                color="danger"
                                variant="striped"
                                height={40}
                                animated
                                value={progressCount}
                            />
                        </CCol>
                        <CCol
                            xs={1}
                            className="d-flex align-items-center justify-content-center"
                        >
                            <img
                                src="https://logos.ask.gov.sg/pa.png"
                                alt="Spinning icon"
                                className="spinning-image mt-3"
                                style={{ width: "40px", height: "40px" }}
                            />
                        </CCol>
                    </CRow>
                )}
                {courts.length > 0 ? (
                    <div id="courts">
                        {courts.map((location, index) =>
                            location.slots &&
                            Object.keys(location.slots).length > 0 ? (
                                <div key={index} className="location">
                                    <h2>
                                        {location.location} {displayedDate}
                                    </h2>
                                    {Object.entries(location.slots).map(
                                        ([court, slots]) => (
                                            <div key={court} className="court">
                                                <h3>{court}</h3>
                                                {slots.map(
                                                    (slot, slotIndex) => (
                                                        <div
                                                            key={slotIndex}
                                                            className="slot"
                                                            onClick={() => {
                                                                window.open(
                                                                    `https://www.onepa.gov.sg/facilities/availability?facilityId=${location.location.replaceAll(
                                                                        " ",
                                                                        ""
                                                                    )}_BADMINTONCOURTS&date=${displayedDate}&time=all`
                                                                );
                                                            }}
                                                        >
                                                            {slot.time}
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        )
                                    )}
                                </div>
                            ) : null
                        )}
                    </div>
                ) : (
                    ""
                )}
            </CContainer>
        </div>
    );
};

export default App;
