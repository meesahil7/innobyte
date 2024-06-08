import { Formik, Form, Field, ErrorMessage } from "formik";
import { useState } from "react";
import styles from "./signup.module.css";
import { Button, Input, Spin, message } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { baseUrl } from "../../config/baseURL";

function validateEmail(value) {
  let error;
  if (!value) {
    error = "Required";
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) {
    error = "Invalid email address";
  }
  return error;
}

const Signup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [state, setState] = useState({
    email: "",
    otp: "",
    otpSent: false,
    userId: "",
    attempts: 0,
  });
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  // to save user details to the database and send an otp to verify email
  const handleSubmit = (value) => {
    setIsLoading(true);
    try {
      axios
        .post(`${baseUrl}/auth/signup`, value)
        .then((res) => {
          messageApi.open({
            type: "success",
            content: res.data.message,
            duration: 2,
          });
          messageApi.open({
            type: "success",
            content: res.data.info,
            duration: 3,
          });
          setState({
            ...state,
            userId: res.data.newUser._id,
            otpSent: true,
            email: value.email,
          });
        })
        .catch((err) => {
          messageApi.open({
            type: "error",
            content: err.response.data.error,
            duration: 3,
          });
        });
      setIsLoading(false);
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  };

  // to verify the client otp with the otp sent to email
  const handleVerify = () => {
    setIsLoading(true);
    try {
      axios
        .post(`${baseUrl}/auth/verifyEmail/${state.userId}`, {
          otp: state.otp,
        })
        .then((res) => {
          messageApi
            .open({
              type: "success",
              content: res.data.message,
              duration: 2,
            })
            .then(() => navigate("/login"));
        })
        .catch((err) =>
          messageApi.open({
            type: "error",
            content: err.response.data.error,
            duration: 3,
          })
        );

      setIsLoading(false);
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  };

  // to resend an otp
  const handleResendOtp = () => {
    setIsLoading(true);
    try {
      axios
        .post(`${baseUrl}/auth/resendOtp/${state.userId}`, {
          email: state.email,
        })
        .then((res) => {
          messageApi.open({
            type: "success",
            content: res.data.message,
            duration: 3,
          });
          setState({ ...state, attempts: state.attempts + 1 });
        })
        .catch((err) =>
          messageApi.open({
            type: "error",
            content: err.response.data.error,
            duration: 3,
          })
        );
      setIsLoading(false);
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {contextHolder}
      <Spin spinning={isLoading} fullscreen={true}></Spin>

      {state.otpSent ? (
        // verify email card
        <div className={styles.form} id={styles.inputForm}>
          <h2>Verify Email</h2>
          <h3>
            A One Time Password (OTP) has <br /> been sent to your email address
          </h3>
          <Input.OTP
            type="number"
            onChange={(value) => setState({ ...state, otp: value })}
          />
          <Button type="primary" onClick={handleVerify}>
            Submit
          </Button>
          {2 - state.attempts !== 0 && (
            <>
              <div className={styles.resendOtp}>
                <p>Didn&apos;t receive OTP?</p>
                <Button type="link" onClick={handleResendOtp}>
                  Resend OTP
                </Button>
              </div>
              {2 - state.attempts === 1 ? (
                <p className={styles.attempt}>1 attempt left</p>
              ) : (
                <p className={styles.attempt}>
                  {2 - state.attempts} attempts left
                </p>
              )}
            </>
          )}
        </div>
      ) : (
        <Formik
          initialValues={{
            fullName: "",
            email: "",
            phoneNumber: "",
            gender: "",
          }}
          onSubmit={handleSubmit}
        >
          {() => (
            // signup form
            <Form className={styles.form}>
              <h2>Sign Up</h2>
              <Field
                name="fullName"
                type="text"
                className={styles.email}
                placeholder="Full Name"
                validate={(value) => !value && "Required"}
              />
              <ErrorMessage
                name="fullName"
                component="div"
                className={styles.errorMsg}
              />
              <Field
                name="email"
                type="email"
                className={styles.email}
                validate={validateEmail}
                placeholder="Email"
              />
              <ErrorMessage
                name="email"
                component="div"
                className={styles.errorMsg}
              />
              <Field
                name="phoneNumber"
                type="number"
                className={styles.email}
                placeholder="Phone Number"
              />
              <Field component="select" name="gender" className={styles.gender}>
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </Field>
              <button type="submit" className={styles.submit}>
                Sign Up
              </button>
              <p>
                Already have an account?{" "}
                <Button type="link" onClick={() => navigate("/login")}>
                  Login
                </Button>
              </p>
            </Form>
          )}
        </Formik>
      )}
    </div>
  );
};

export default Signup;
