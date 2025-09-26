import AXIOS_INSTANCE from "../axios";

export const getStatesApi = () => 
    AXIOS_INSTANCE.get('/utils/states-cities/');

export const getCitiesApi = (state) =>
    AXIOS_INSTANCE.post(`/utils/states-cities/`, {state: state});