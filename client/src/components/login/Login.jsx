import { UserOutlined } from "@ant-design/icons";
import { Button, Form, Input, Spin, message } from "antd";
import styles from "./login.module.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { useAuthContext } from "../../context/AuthContext";
import { baseUrl } from "../../config/baseURL";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [state, setState] = useState({
    email: "",
    otp: "",
    otpSent: false,
    userId: "",
    verify: "Login",
    attempts: 0,
  });
  const { setAuthUser } = useAuthContext();
  const navigate = useNavigate();

  const onFinish = (value) => {
    const { email } = value;
    setIsLoading(true);
    try {
      axios
        .post(`${baseUrl}/auth/login`, {
          email,
        })
        .then((res) => {
          messageApi.open({
            type: "success",
            content: res.data.message,
            duration: 3,
          });
          if (res.status === 201) {
            messageApi.open({
              type: "success",
              content: res.data.info,
              duration: 3,
            });
            setState({
              ...state,
              userId: res.data.userId,
              otpSent: true,
              email: email,
              verify: "Email",
            });
          } else {
            setState({
              ...state,
              userId: res.data.userId,
              otpSent: true,
              email: email,
            });
          }
        })
        .catch((err) => {
          return messageApi.open({
            type: "error",
            content: err.response.data.error,
            duration: 3,
          });
        });
      setIsLoading(false);
    } catch (e) {
      console.log(e);
      setIsLoading(false);
    }
  };

  // to verify the client otp with the otp sent to email
  const handleVerify = () => {
    setIsLoading(true);
    try {
      // if user is registered but email is not verified
      if (state.verify === "Email") {
        axios.post(`${baseUrl}/auth/verifyEmail/${state.userId}`, {
          otp: state.otp,
        });
      }
      // login code
      axios
        .post(`${baseUrl}/auth/verifyLogin/${state.userId}`, {
          otp: state.otp,
        })
        .then((res) => {
          const token = res.data.token;
          Cookies.set("innobyteJwt", token);
          messageApi
            .open({
              type: "success",
              content: res.data.message,
              duration: 2,
            })
            .then(() => {
              setAuthUser(token);
              navigate("/");
            });
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
      <Spin spinning={isLoading} fullscreen></Spin>
      {state.otpSent ? (
        <div className={styles.form} id={styles.inputForm}>
          <h2>Verify {state.verify}</h2>
          <h3>A One Time Password (OTP) has been sent to your email address</h3>
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
        <div className={styles.form}>
          <h2>Login</h2>
          <Form
            name="normal_login"
            className="login-form"
            initialValues={{
              remember: true,
            }}
            onFinish={onFinish}
          >
            <Form.Item
              name="email"
              rules={[
                {
                  required: true,
                  message: "Please input your email!",
                },
              ]}
            >
              <Input
                prefix={<UserOutlined className="site-form-item-icon" />}
                placeholder="Email"
              />
            </Form.Item>

            <Form.Item style={{ display: "flex", gap: "30px" }}>
              <Button
                type="primary"
                htmlType="submit"
                className="login-form-button"
              >
                Log in
              </Button>
              <span> Or</span>
              <Button type="link" onClick={() => navigate("/signup")}>
                Register now
              </Button>
            </Form.Item>
          </Form>
        </div>
      )}
    </div>
  );
};
export default Login;
