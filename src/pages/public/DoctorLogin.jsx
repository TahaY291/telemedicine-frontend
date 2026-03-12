import React, { useEffect } from "react";
import { useContext } from "react";
import { AppContext } from "../../context/Context.jsx";
import PatientAuth from "./PatientLogin.jsx";

const DoctorLogin = ({ mode = "login" }) => {
  const { setRole } = useContext(AppContext);

  useEffect(() => {
    setRole("doctor");
  }, [setRole]);

  return <PatientAuth mode={mode} forcedRole="doctor" />;
};

export default DoctorLogin;