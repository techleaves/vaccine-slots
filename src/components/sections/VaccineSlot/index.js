import React, { useState, useInterval } from "react";
import axios from "axios";
import { Table, Thead, Tbody, Tr, Th, Td } from "react-super-responsive-table";
import {
  Row,
  Col,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Tooltip,
  ModalFooter,
  Alert,
  Badge,
} from "reactstrap";
import "react-dropdown-now/style.css";
import { ButtonToggle } from "reactstrap";
import SpinnerBlock from "./spinner";
import Moment from "moment";
import SelectSearch from "react-select-search";
import "react-select-search/style.css";
import fuzzySearch from "../../../util/search";
import Section from "../../../HOC/Section";
import "./index.scss";
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css'
import TimeFormat from '../../../util/common';
import Switch from "react-switch";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "checkboxes/dist/css/checkboxes.min.css";
// import DatePicker from 'react-date-picker';
import useSound from 'use-sound';

import alertMp3 from '../../../assets/mp3/alert.mp3';
import { FcInfo, FcSpeaker, FcCancel, FcOk } from "react-icons/fc";

function VaccineSlot(props) {
  let [states, setStates] = React.useState([]);
  let [districts, setDistricts] = React.useState([]);
  let [selectedState, setSelectedState] = React.useState('');
  let [selectedDistrict, setSelectedDistrict] = React.useState('');
  let [enableDistrict, setEnableDistrict] = React.useState(false);
  let [loader, setLoader] = React.useState(false);
  let [availableSlots, setAvailableSlots] = React.useState([]);
  const [modal, setModal] = useState(false);
  const [backdrop] = useState(true);
  const [keyboard] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState([]);
  const [visibleResults, setVisibleResults] = useState(false);
  const [enablePinCode, setEnablePinCode] = useState(false);
  const [selectedPinCode, setSelectedPinCode] = useState('');
  const { className } = props;
  const toggle = () => setModal(!modal);
  const [searchDate, setSearchDate] = useState(Moment().format("DD/MM/YY"));
  const [startDate, setStartDate] = useState(new Date());
  const [validationError, setValidationError] = useState('');
  const [selectDate, setSelectDate] = useState(new Date());
  const [checked, setChecked] = useState(true);
  const [enableAlert, setEnableAlert] = useState(false);
  const [alertFilter, setAlertFilter] = useState({})
  const alertInterval = 150000;
  const [audio] = useState(new Audio(alertMp3));
  const [selectedDistrictName, setSelectedDistrictName] = useState('')
  React.useEffect(() => {
    localStorage.setItem('enableAlert', false);
    localStorage.setItem('alertFilter', '')
  }, []);
  // set interval alert data
  const fetchDataByInterval = React.useCallback((searchBy, dId) => {
    setLoader(true);
    let url = "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=" + dId + "&date=" + searchDate;
    if (searchBy && searchBy === 'pincode') {
      url = "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=" + dId + "&date=" + searchDate;
    }
    axios({
      method: "GET",
      url: url,
      headers: {
        "content-type": "application/json",
      },
    })
      .then((response) => {
        // if (response.data.centers)
        if (response.data.centers && response.data.centers.length > 0) {
          let isAvailableCount = 0;

          response.data.centers.map((slot, key) => {
            slot.sessions.map((session) => {
              isAvailableCount += session.available_capacity;
              return true;
            });
          });

          if (isAvailableCount && isAvailableCount > 0) {
            console.log('here alert ', isAvailableCount);
            audio.play();
          } else {
            console.log('here no alert ', isAvailableCount);
          }

        }
        setAvailableSlots(response.data.centers);
        setLoader(false);
        setVisibleResults(true);
      })
      .catch((error) => {
        setLoader(false);
        setVisibleResults(false);
      });
  }, []);

  const [play, { stop }] = useSound(
    "http://localhost:3000/static/media/alert.0bd3827c.mp3",
    { volume: 0.5 }
  );




  // Fetch data from API - https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByPin?pincode=110001&date=31-03-2021
  const fetchSlotByPinCodeData = React.useCallback((dId) => {
    setLoader(true);
    axios({
      method: "GET",
      url:
        "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=" + dId + "&date=" + searchDate,
      headers: {
        "content-type": "application/json",
      },
    })
      .then((response) => {
        // if (response.data.centers)
        setAvailableSlots(response.data.centers);
        setLoader(false);
        setVisibleResults(true);
      })
      .catch((error) => {
        setLoader(false);
        setVisibleResults(false);
      });
  }, [searchDate]);


  const fetchSlotData = React.useCallback((dId) => {
    setLoader(true);
    axios({
      method: "GET",
      url:
        "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=" +
        dId +
        "&date=" +
        searchDate,
      headers: {
        "content-type": "application/json",
      },
    })
      .then((response) => {
        // if (response.data.centers)
        setAlertFilter({
          pinCode: '',
          state: selectedState,
          district: selectedDistrict
        })
        setAvailableSlots(response.data.centers);
        setLoader(false);
        setVisibleResults(true);
      })
      .catch((error) => {
        setLoader(false);
        setVisibleResults(false);
      });
  }, [searchDate]);

  const fetchDistrictData = React.useCallback((state_id) => {
    setLoader(true);
    axios({
      method: "GET",
      url:
        "https://cdn-api.co-vin.in/api/v2/admin/location/districts/" + state_id,
      headers: {
        "content-type": "application/json",
      },
    })
      .then((response) => {
        let districtsList = [];
        if (response.data.districts) {
          response.data.districts.map((e, i) =>
            districtsList.push({
              id: e.district_id,
              value: e.district_id,
              label: e.district_name,
              name: e.district_name,
            })
          );
        }
        setEnableDistrict(true);
        setDistricts(districtsList);
        setLoader(false);
      })
      .catch((error) => {
        setLoader(false);
      });
  }, []);

  const fetchStateData = React.useCallback(() => {
    setLoader(true);
    axios({
      method: "GET",
      url: "https://cdn-api.co-vin.in/api/v2/admin/location/states",
      headers: {
        "content-type": "application/json",
      },
    })
      .then((response) => {
        let stateList = [];
        if (response.data.states) {
          response.data.states.map((e, i) =>
            stateList.push({
              id: e.state_id,
              value: e.state_id,
              label: e.state_name,
              name: e.state_name,
            })
          );
        }
        setStates(stateList);
        setLoader(false);
      })
      .catch((error) => {
        setLoader(false);
      });
  }, []);
  React.useEffect(() => {
    const interval = setInterval(() => {
      const enableAlertCheck = localStorage.getItem('enableAlert');
      if (enableAlertCheck === 'true') {
        const alertFilter = JSON.parse(localStorage.getItem('alertFilter'));
        if (alertFilter) {
          if (alertFilter.pinCode) {
            fetchDataByInterval('pincode', alertFilter.pinCode);
          } else if (alertFilter.district) {
            fetchDataByInterval('', alertFilter.district);
          }
        }
      }
    }, alertInterval);
    return () => clearInterval(interval);
  }, []);
  React.useEffect(() => {
    fetchStateData();
  }, [fetchStateData]);

  const handleDistrictList = (value) => {
    setEnableDistrict(false);
    fetchDistrictData(value);
    setSelectedState(value);
    setVisibleResults(false);
    setValidationError('');
    // validationBySearch();
    console.log(selectedState);
    handleAlertSettings();
  };

  const handleSetDistrict = (value, obj) => {
    console.log('name', obj)
    setSelectedDistrict(value);
    setVisibleResults(false);
    setValidationError('');
    // validationBySearch();
    handleAlertSettings();
    setSelectedDistrictName(obj.name);
  };

  const validationBySearch = (searchBy) => {
    let validationError = false;
    setValidationError('');
    if (searchBy && searchBy === 'pincode') {
      console.log('jerere code', selectedPinCode.length)
      if (selectedPinCode === '' || (selectedPinCode.length !== 6)) {
        setValidationError('Please enter valid pincode');
        validationError = true;
      } else {
        setValidationError('');
      }
    } else {
      if (selectedState === '') {
        validationError = true;
        setValidationError('Please select state')
      } else if (selectedDistrict === '') {
        validationError = true;
        setValidationError('Please select district')
      }
    }
    return validationError;
  }

  const handleSearch = (searchBy) => {
    const validationCheck = validationBySearch(searchBy);
    console.log("select date pick", Moment(startDate).format("DD/MM/YY"));
    setSearchDate(Moment(startDate).format("DD/MM/YY"));
    if (!validationCheck) {
      if (searchBy && searchBy === 'pincode') {
        console.log('Search by pin', selectedPinCode);
        setAlertFilter({
          'pinCode': selectedPinCode,
          'state': "",
          "district": ""
        });
        const filterObj = {
          pinCode: selectedPinCode,
          district: ""
        };
        localStorage.setItem('alertFilter', JSON.stringify(filterObj));

        fetchSlotByPinCodeData(selectedPinCode);

      } else {
        const filterObj = {
          pinCode: '',
          district: selectedDistrict
        };
        localStorage.setItem('alertFilter', JSON.stringify(filterObj));
        fetchSlotData(selectedDistrict);

      }
    }
    // if (selectedState === 0) {
    //   setStateValidation('Please select state')
    // } else if (selectedDistrict === 0) {
    //   setStateValidation('');
    //   setDistrictValidation('Please select district')
    // } else {

    // }

  };
  const getStateFilters = () => {
    return (<>
      <SelectSearch
        options={states}
        search
        filterOptions={fuzzySearch}
        placeholder="Select your state"
        onChange={(value) => handleDistrictList(value)}
      />
    </>
    );
  };

  const getDistrictFilters = () => {
    return (
      <><SelectSearch
        options={districts}
        search
        filterOptions={fuzzySearch}
        placeholder="Select your district"
        onChange={(value, obj) => handleSetDistrict(value, obj)}
      />
      </>
    );
  };

  const getPinCodeTextField = () => {
    return (
      <><Col className="form-group" md={4} lg={4}>
        <label >Pincode</label>
        <input type="number" className="form-control" id="pincode" placeholder="Enter pincode" onChange={(evt) => handlePincode(evt)} />
        {/* <small id="emailHelp" class="form-text text-muted">We'll never share your email with anyone else.</small> */}
      </Col>
        {<Col md={4} lg={4} className="form-group date_picker_block">
          <label >Date</label>
          {getDatePicker()}
        </Col>}
        {getPinCodeSearchButton()}
      </>
    )
  }

  const handlePincode = (event) => {
    setSelectedPinCode(event.target.value);
    setSelectedDistrict('');
    setSelectedDistrictName('')
    setSearchDate(Moment().format("DD/MM/YY"));
    setStartDate(new Date())
    // validationBySearch('pincode');
  }

  const handleSlotDetails = (slotObj) => {
    setSelectedSlot(slotObj);
    toggle();
  };

  const handleSwitchChange = () => {
    setVisibleResults(false);
    setEnableDistrict(false);
    setEnablePinCode(!enablePinCode);
    setSelectedDistrict('');
    setSelectedDistrictName('');
    setSelectedState('');
    setValidationError('')
    handleAlertSettings();
    setSearchDate(Moment().format("DD/MM/YY"));
    setStartDate(new Date())
  }

  const handleAlertSettings = () => {
    localStorage.setItem('enableAlert', false);
    localStorage.setItem('alertFilter', '');
    setEnableAlert(false)
  }

  const getPinCodeToggle = () => {
    return (
      <label>
        <span>Search By PIN </span>
        <Switch onChange={() => handleSwitchChange()} checked={enablePinCode} />
      </label>
    );
  }

  const handleAlertSwitch = () => {
    setEnableAlert(!enableAlert);
    localStorage.setItem('enableAlert', !enableAlert);
  }

  const handleDatePicker = (dateVal) => {
    if (dateVal) {
      setSearchDate(Moment(dateVal).format("DD/MM/YY"));
    } else {
      setSearchDate(Moment().format("DD/MM/YY"));
    }
    setStartDate(dateVal);
  }
  const [tooltipOpen, setToolTipOpen] = useState(false);

  const toggleToolTip = () => {
    setToolTipOpen(!tooltipOpen);
  }


  const getAlertToggle = () => {
    return (
      <label className="custom_toggle">
        <span>Enable alert </span>{"  "}<FcInfo onMouseEnter={() => { toggleToolTip () }} />
      <Tooltip placement="left" isOpen={tooltipOpen} toggle={toggleToolTip} target="TooltipExample">
        Set alert for vaccine availablity
      </Tooltip>
        <Switch onChange={() => handleAlertSwitch()} checked={enableAlert} />
      </label>
    );
  }

  const getAlertSwitch = () => {

    return (
      <><span>Enable alert</span><label htmlFor="small-radius-switch" className="custom_toggle">
      
  <Switch
    checked={enableAlert}
    onChange={() => handleAlertSwitch()}
    handleDiameter={24}
    // offColor="#08f"
    // onColor="#0ff"
    // offHandleColor="#0ff"
    // onHandleColor="#08f"
    height={25}
    width={54}
    borderRadius={16}
    // activeBoxShadow="0px 0px 1px 2px #fffc35"
    uncheckedIcon={<FcSpeaker />}
    checkedIcon={<FcOk/>}
    uncheckedHandleIcon={<FcCancel />}
    checkedHandleIcon={<FcSpeaker />}
    className="react-switch"
    id="small-radius-switch"
  />
</label></>)
  }

  const getTotalAvailabilityDose = () => {
    let availableCapacity = 0;
    availableSlots.map((slot, key) => {
      slot.sessions.map((session) => {
        availableCapacity += session.available_capacity;
        return true;
      });
    });
    return availableCapacity;
  }

  const getTotalAvailabilityCenter = () => {
    let availableCapacity = 0;
    availableSlots.map((slot, key) => {
      slot.sessions.map((session) => {
        if (session.available_capacity > 0) {
          availableCapacity += 1;
          return true;
        }
      });
    });
    return availableCapacity;
  }


  const getAvailableCenters = () => {

    return (
      <Table>
        <Thead>
          <Tr>
            <Th>#</Th>
            <Th>Center</Th>
            <Th>Fee</Th>
            <Th>Availability</Th>
            <Th>Time</Th>
            <Th>Status</Th>
          </Tr>
        </Thead>
        <Tbody>
          {availableSlots.map((slot, key) => {
            let availableCapacity = 0;
            slot.sessions.map((session) => {
              availableCapacity += session.available_capacity;
              return true;
            });
            let btnColor = 'success';
            if (availableCapacity < 10 && availableCapacity > 0) {
              btnColor = 'danger';
            } else if (availableCapacity > 10 && availableCapacity < 75) {
              btnColor = 'warning';
            } else if (availableCapacity === 0) {
              btnColor = 'dark'
            }
            return (
              <Tr key={"slot-" + key} className={availableCapacity > 0 ? 'available' : ''}>
                <Td className="pt-2">{key + 1}</Td>
                <Td className="pt-2">{slot.name}
                  {/* <br/>{slot.address.length > 35 ? slot.address.substring(0, 35) + "..." : slot.address} */}
                </Td>
                <Td className="pt-2">{slot.fee_type}</Td>
                <Td>

                  <Badge pill color={btnColor} onClick={() => handleSlotDetails(slot)}>
                    {availableCapacity}
                  </Badge>
                </Td>
                <Td className="pt-2">
                  {TimeFormat(slot.from)} - {TimeFormat(slot.to)}
                </Td>
                <Td className="pt-2" style={{ cursor: 'pointer' }}>
                  <Badge color="info" onClick={() => handleSlotDetails(slot)}>
                    Details
                  </Badge>
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    );
  };
  const getPinCodeSearchButton = () => {
    return (
      <Col
        sm={3}
        className="mt-2"
        mt={1}
        style={{ alignItems: "center", justifyContent: "center" }}
      >
        <label style={{ maxHeight: '16px', color: 'red' }}>{validationError}</label>
        <div className="rdn">
          {loader ? (
            <SpinnerBlock />
          ) : (
            <ButtonToggle
              color="primary"
              onClick={() => {
                handleSearch('pincode');
              }}
            >
              Search
            </ButtonToggle>
          )}
        </div>
      </Col>
    )
  };

  const getSearchButton = () => {
    return (
      <Col
        sm={2}
        className="mt-2"
        mt={2}
        style={{ alignItems: "flex-end", justifyContent: "center" }}
      >
        <label style={{ height: '16px', color: 'red' }}>{validationError}</label>
        <div className="rdn">
          {loader ? (
            <SpinnerBlock />
          ) : (
            <ButtonToggle
              color="primary"
              onClick={() => {
                handleSearch();
              }}
            >
              Search
            </ButtonToggle>
          )}
        </div>
      </Col>
    )
  };

  const getDatePicker = () => {
    return (
      <DatePicker onKeyDown={(e)=> {e.preventDefault();}} onKeyPress={(e)=> {e.preventDefault();}} showPreviousMonths={false} style={{ height: "inherit" }} minDate={new Date()} selected={startDate} onChange={date => handleDatePicker(date)} />
    );
  }

  const getResults = () => {
    return (
      visibleResults &&
      <div>
        <div className="mt-3 slot-title"><span><h4>Slot & Sessions </h4></span><span className="alert-span">{getAlertSwitch()}</span></div>
        <h6></h6>
        <div className="widget-padding-md">
          <Row>
            <Col lg={12} md={12} sm={12}>
            
              {availableSlots && availableSlots.length > 0 && (<Alert color="success">
                <p>You searched for vaccine availability in <b>{selectedDistrictName} </b> district on <b>{searchDate}</b></p>
                <p>
                {false && <b><code>{getTotalAvailabilityCenter()}</code>{" "}</b>}

                  <b>
                  {" "}<code>{getTotalAvailabilityDose()}</code>{" "}
                </b>{" "}vaccines are available on <b>{searchDate}</b>. For Registration & booking , Please visit <a href="https://selfregistration.cowin.gov.in/" target="_blank">www.cowin.gov.in</a>
              </p></Alert>)}
              
              
            </Col>
            <Col md={12} lg={12}>
            {availableSlots && availableSlots.length > 0
                ? getAvailableCenters()
                : <Alert color="warning"><p>You searched for vaccine availability in {selectedDistrictName && <><b>{selectedDistrictName} </b> district on</>} {selectedPinCode && <><b>{selectedPinCode}</b> pincode on</>} <b>{searchDate}</b></p>
                No Vaccination center is available for booking.</Alert>}
            </Col>
          </Row>
          <Row>
          
          </Row>
        </div>
      </div>)

  }

  const calenderComponent = () => {
    return (
      <DatePicker
        onChange={setSelectDate}
        value={selectDate}
      />
    )
  }

  const checkBoxComponent = () => {
    return (
      <input type="checkbox" class="checkbox" style={{ size: '20px', radius: '8px', bg: '#000000', color: '#F47A37', time: '0.4s' }} {...checked} />
    )
  }



  const slotFinder = () => {
    return (<><Col sm={4} className="mt-3" mt={2}>
      <h6>State</h6>
      {getStateFilters()}
    </Col>
      {enableDistrict && <Col sm={3} className="mt-3" mt={2}>
        <h6>District</h6>
        {getDistrictFilters()}
      </Col>
      }
      {enableDistrict && <Col md={3} lg={3} className="form-group date_picker_block mt-2">
        <label >Date</label>
        {getDatePicker()}
      </Col>}
      {getSearchButton()}

    </>

    )
  };

  const getModalData = () => {
    let slotsAvailable = 0;
    selectedSlot.sessions.map((session) => {
      slotsAvailable += session.slots.length;
      return true;
    });
    return (
      <Modal
        isOpen={modal}
        toggle={toggle}
        className={className}
        backdrop={backdrop}
        keyboard={keyboard}
      >
        <ModalHeader toggle={toggle}><span><b>{selectedSlot && selectedSlot.name}</b> - {selectedSlot && selectedSlot.address}(#<b>{slotsAvailable}</b>) slots</span>
        </ModalHeader>
        <ModalBody>
          <Table>
            <Thead>
              <Tr>
                <Th style={{ width: '12%' }}>Date</Th>
                <Th style={{ width: '12%' }}>Vaccine</Th>
                <Th style={{ width: '14%' }}>From Age</Th>
                <Th style={{ width: '15%' }}>Availability</Th>
                <Th>Slots</Th>
              </Tr>
            </Thead>
            <Tbody>
              {selectedSlot.sessions.map((session, key) => {
                let btnColor = 'success';
                const availableCapacity = session.available_capacity
                if (availableCapacity < 10 && availableCapacity > 0) {
                  btnColor = 'danger';
                } else if (availableCapacity > 10 && availableCapacity < 75) {
                  btnColor = 'warning';
                } else if (availableCapacity === 0) {
                  btnColor = 'dark'
                }
                return (
                  <Tr key={"slots-block-" + key}>
                    <Td className="pt-2">{session.date}</Td>
                    <Td className="pt-2"><Badge href="#" color="info">{session.vaccine}</Badge></Td>
                    <Td className="pt-2">{session.min_age_limit}+</Td>
                    <Td>
                      <Badge pill color={btnColor}>
                        {availableCapacity}
                      </Badge>
                    </Td>
                    <Td className="pt-2">
                      {session.slots.map((slot, keyId) => {
                        return (<span key={"slot-time" + keyId}><Badge pill href="#" color="success">{slot}</Badge> {" "}</span>)
                      })}
                    </Td>

                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggle}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    );
  };

  const getCheckBox = () => {
    return (
      visibleResults && <Row className="mt-4">
        <Col md={2} lg={2} style={{ display: 'flex', alignItems: 'center' }}>
          {checkBoxComponent()}{" "} Free
                      </Col>
        <Col md={2} lg={2} style={{ display: 'flex', alignItems: 'center' }}>
          {checkBoxComponent()}{" "}  Paid
                      </Col>
        <Col md={2} lg={2} style={{ display: 'flex', alignItems: 'center' }}>
          {checkBoxComponent()}{" "}  Covaxin
                      </Col>
        <Col md={2} lg={2} style={{ display: 'flex', alignItems: 'center' }}>
          {checkBoxComponent()}{" "}  Covishield
                      </Col>
        <Col md={2} lg={2} style={{ display: 'flex', alignItems: 'center' }}>
          {checkBoxComponent()}{" "}  18+
                      </Col>
        <Col md={2} lg={2} style={{ display: 'flex', alignItems: 'center' }}>
          {checkBoxComponent()}{" "}  45+
                      </Col>
      </Row>
    )
  }

  return (
    <Section id="contact">
      <div className="container pt-2 pb-5">
        <div className="section-header pt-5 pb-5 text-center"></div>
        <div className="section-content">
          <div className="row">
            <div className="col-md-12 col-lg-12 mr-auto ml-auto">
              <Row>
                <Col md={12} lg={12} style={{ display: 'flex' }}>
                  <h4 className="page-title">
                    Vaccine Slot -{" "}
                    <span className="fw-semi-bold">Availability</span>
                  </h4>
                </Col>
              </Row>
              <Row>
                <Col md={12} lg={12} style={{ display: 'flex' }} className="mt-2">
                  <Col md={6} lg={6} className="alert_toggle p-0">
                    {/* {getAlertToggle()} */}
                  </Col>

                  <Col md={6} lg={6} className="pincode_toggle p-0">
                    {getPinCodeToggle()}
                  </Col>
                </Col>
              </Row>

              <Row>
                <Col xs={12} lg={12}>
                  <div className="widget-padding-md">
                    <Row>
                      {enablePinCode ? getPinCodeTextField() : slotFinder()}
                      { }
                    </Row>

                    {/* {getCheckBox()} */}
                    {getResults()}
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </div>
        {modal && getModalData()}
      </div>
    </Section>
  );
}

export default VaccineSlot;
