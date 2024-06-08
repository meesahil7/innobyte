import { useEffect, useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import axios from "axios";
import { Button, Input, Select, Spin, message } from "antd";
import styles from "../styles/home.module.css";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState({});
  const [edit, setEdit] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const { authUser, setAuthUser } = useAuthContext();
  const navigate = useNavigate();

  const handleUpdateUser = () => {
    setIsLoading(true);
    try {
      const { fullName, phoneNumber, gender } = user;
      const payload = { fullName, phoneNumber, gender };
      axios
        .patch(`http://localhost:8080/user/profile/update`, payload, {
          headers: { Authorization: authUser },
        })
        .then((res) => {
          messageApi.open({
            type: "success",
            content: res.data.message,
            duration: 3,
          });
          setEdit(false);
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

  const handleLogOut = () => {
    setAuthUser(null);
    Cookies.remove("innobyteJwt");
    navigate("/login");
  };

  useEffect(() => {
    setIsLoading(true);
    axios
      .get("http://localhost:8080/user/profile", {
        headers: { Authorization: authUser },
      })
      .then((res) => setUser(res.data.user))
      .catch((err) => console.log(err));
    setIsLoading(false);
  }, [authUser]);

  // console.log(user);
  return (
    <div className={styles.container}>
      <Spin spinning={isLoading} fullscreen></Spin>
      {contextHolder}
      <div className={styles.mainDiv}>
        <h2>Welcome User</h2>
        {edit ? (
          <div className={styles.form}>
            <Input
              placeholder="Name"
              defaultValue={user.fullName}
              onChange={(e) => setUser({ ...user, fullName: e.target.value })}
            />
            <Input
              placeholder="Phone Number"
              defaultValue={user.phoneNumber}
              onChange={(e) =>
                setUser({ ...user, phoneNumber: e.target.value })
              }
            />
            <Select
              placeholder="Select Gender"
              defaultValue={user.gender}
              onChange={(value) => setUser({ ...user, gender: value })}
              options={[
                { label: "Male", value: "Male" },
                { label: "Female", value: "Female" },
              ]}
            />
            <Button type="primary" onClick={handleUpdateUser}>
              Update User
            </Button>
          </div>
        ) : (
          <>
            <p>Your name : {user.fullName}</p>
            <p>Email : {user.email}</p>
            <p>Phone Number : {user.phoneNumber}</p>
            <p>Gender : {user.gender}</p>
            <Button type="primary" onClick={() => setEdit(true)}>
              Edit
            </Button>
          </>
        )}
      </div>
      <Button
        type="primary"
        className={styles.logoutBtn}
        onClick={handleLogOut}
      >
        Logout
      </Button>
    </div>
  );
};

export default Home;
