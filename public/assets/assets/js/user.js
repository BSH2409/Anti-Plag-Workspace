//var urlbase = "https://aspiringhomes.herokuapp.com/";
var urlbase = window.location.origin + "/";
$(document).ready(function () {
        //$('.single-select').select2();
        
        //validator to check emailId is unique or not
            $.validator.addMethod("haveAccount", function (value) {
                var data = { email: value };
                console.log(JSON.stringify(data));
                var found = $.ajax({
                        type: "POST",
                        contentType: "application/json",
                        async: false,
                        data: {},
                        url: urlbase + "user/checkAccount/" + value,
                        datatype: "json",
                        success: function (data) {
                            return data;
                        },
                        error: function (error) {
            console.log(error);
          if(!navigator.onLine) swal("You are offline", "", "info");
          else swal("Error!",error.responseText,"error");
        }
                    });
                if (found.responseJSON.match) {
                    return false;
                }
                else {
                    return true;
                }
                //return !found.responseJSON.d;
            }, "Already have an account go and login");
            
            //validator to check user name is available or not
            
            $.validator.addMethod("chkUsername", function (value) {
                
                var data = { username: value };
                var found = $.ajax({
                    type: "POST",
                    contentType: "application/json",
                    async: false,
                    url: urlbase + "minor/checkUsername/" + data.username,
                    data: {},
                    datatype: "json",
                    success: function (data) {
                        return data;
                    },
                    error: function (error) {

          if(!navigator.onLine) swal("You are offline", "", "info");
          else swal("Error!",error.responseText,"error");

                    }

                });
                //console.log(found);
                //console.log(!found.responseJSON.d);
                if (found.responseJSON.match) {
                    return false;
                }
                else {
                    return true;
                }
                //return !found.responseJSON.d;
            }, "Not Available");
            
            
            //setting defaults i.e. border colors
            $.validator.setDefaults({
                highlight: function (element) {
                    $(element).removeClass('fieldset');
                    $(element).addClass('errorhighlight');
                },
                unhighlight: function (element) {
                    $(element).removeClass('errorhighlight');
                    $(element).addClass('fieldset');
                }
            });
            // validate signup form on keyup and submit
            $("#registerTenant").validate({
                invalidHandler: function(form, validator) {
                    var errors = validator.numberOfInvalids();
                    if (errors) {                    
                        validator.errorList[0].element.focus();
                    }
                } ,
                rules: {
                    errorClass: "error have-alert",
                    name: {
                        required: true,
                        minlength: 3,
                        maxlength:40
                    },
                    phone: {
                        required: true,
                        number:true,
                        minlength: 10
                    },
                    email: {
                        required: true,
                        email: true,
                        haveAccount: true
                    },
                    username: {
                        required: true,
                        minlength: 6,
                        maxlength: 20,
                        chkUsername:true
                    },
                    password: {
                        required: true,
                        minlength: 8,
                        maxlength: 20
                    }
                    
                },
                messages: {
                    name: {
                        required: "Please enter your name",
                        minlength: "Minimum 3 characters",
                        maxlength:"Maximun 40 characters"
                    },
                    phone: {
                        required: "Please enter your 10 digit number",
                        minlength: "Minimum 10 digits",
                        number: "Please enter a valid number"
                    },
                    email: {
                        required: "Please enter your email address",
                        email: "Please enter a valid email"
                    },
                    username: {
                        required: "Please enter a username",
                        minlength: "at least 6 characters",
                        maxlength: "at max 20 characters"
                    },
                    password: {
                        required: "Please provide a password",
                        minlength: "at least 8 characters long",
                        maxlength: "at max 20 characters long"
                    }
                    
                }
            });

            function isValid(field) {
                $(field).valid();
            }
            $('#txtName').on("keyup", function () {
                isValid("#txtName");
            });
            $('#txtPhone').on("keyup", function () {
                isValid("#txtPhone");
            });
            $('#txtEmail').on("keyup", function () {
                isValid("#txtEmail");
            });
            $('#txtUsername').on("keyup", function () {
                isValid("#txtUsername");
            });
            $('#txtPassword').on("keyup", function () {
                isValid("#txtPassword");
            })
            
      });

      function show_password(){
        console.log("in");
        const show = document.querySelector("#show_password i");
        const field = document.querySelector("#txtPassword");
        show.classList.add("hide-btn");
        if (field.type === "password") {
            field.type = "text";
            show.classList.add("hide-btn");
        } else {
            field.type = "password";
            show.classList.remove("hide-btn");
        }
      }
        //send otp
        $("#btn_otp").on("click", function () {
            if ($("#txtEmail").valid() && $("#txtName").valid() && $("#txtPhone").valid()) {
                var record = {
                        name: $("#txtName").val(),
                        phone: $("#txtPhone").val(),
                        email: $("#txtEmail").val(),
                        otp: ""
                    };
                
                //console.log(data);
                $.ajax({
                    type: "POST",
                    contentType: "application/json",
                    async: true,
                    url: urlbase + "minor/sendOTP",
                    //data: "{'admininfo':" + JSON.stringify(data) + "}",
                    data: JSON.stringify(record),
                    datatype: "json",
                    beforeSend: function () {

                        $("#i_send_otp").removeClass("d-none");
                        $("#btn_otp").attr('disabled', true);
                        $("#span_send_otp").text("Sending..");
                    },
                    success: function (response) {
                        //console.log(response);
                    },
                    complete: function () {
                        setTimeout(function () {
                            $("#i_send_otp").addClass("d-none");
                            $("#btn_otp").attr('disabled', false);
                            $("#span_send_otp").text("RESEND");
                            $("#user_otp").attr('placeholder', "Enter the OTP");
                            $("#user_otp").focus();
                            $("#user_otp").attr('disabled', false);
                            $("#btn_verify_otp").attr('disabled', false);
                            
                        }, 2000);
                    },
                    error: function (error) {

          if(!navigator.onLine) swal("You are offline", "", "info");
          else swal("Error!",error.responseText,"error");
                        //if (!navigator.onLine) {
                        //    window.location = "errors-404-error.html";
                        //}
                        //alert('error : ' + error);
                        console.log(error);

                    }
                });

            }
            else if (!$("#user_email").valid()) { $("#user_email").focus() }
            else if (!$("#user_name").valid()) { $("#user_name").focus() }
            else if (!$("#user_phone").valid()) { $("#user_phone").focus() }
            
        });

        //validate otp
        $("#user_otp").on("keyup", function () {
            //console.log("in");
            if (!$("#user_otp-error").hasClass("d-none")) {
                $("#user_otp-error").addClass("d-none")
            }
            if ($("#user_otp").val().length == 0) {
                $("#user_otp-error").removeClass("d-none");
                $("#user_otp-error").text("Please enter the otp");
                $("#btn_verify_otp").attr('disabled',true);
                return;
            }
            if ($("#user_otp").val().length < 6) {
                $("#user_otp-error").removeClass("d-none");
                $("#user_otp-error").text("Complete the 6 characters");
                $("#btn_verify_otp").attr('disabled',true);
                return;
            }
            $("#user_otp-error").addClass("d-none");
            $("#btn_verify_otp").click();
            
        });

            //verify otp
        $("#btn_verify_otp").on("click", function () {
            if ($("#user_otp").val() == "") {
                $("#user_otp-error").removeClass("d-none");
                $("#user_otp").focus();
                return;
            }
            if ($("#user_otp").val().length < 6) {
                $("#user_otp-error").removeClass("d-none");
                $("#user_otp-error").text("Complete the 6 characters");
                $("#user_otp").focus();
                return;
            }
            var data = { otp: $("#user_otp").val(), email: $("#txtEmail").val() };
            //var data = { otp: "234356", email: "gkunal13579@gmail.com" };
            $.ajax({
                type: "POST",
                contentType: "application/json",
                async: true,
                url: urlbase + "minor/checkOTP/"+data.email+"/"+data.otp,
                data: {},
                datatype: "json",
                beforeSend: function () {
                    $("#i_check_otp").removeClass("d-none");
                    $("#btn_otp").attr('disabled', true);
                    $("#btn_verify_otp").attr('disabled', true);
                    $("#span_verify_otp").text("cheking..");
                },
                success: function (response) {
                    console.log(response.match);
                    if (response.match) {
                        setTimeout(function () {
                            $("#i_check_otp").addClass("d-none");
                            $("#i_verified_otp").removeClass("d-none");
                            $("#span_verify_otp").text("Verified");
                            $("#user_otp").attr('disabled', true);
                            $("#txtName").attr('disabled', true);
                            $("#txtPhone").attr('disabled', true);
                            $("#txtEmail").attr('disabled', true);
                            $("#user_otp-error").addClass("d-none");
                            $("#user_otp-error").addClass("verified");
                        }, 1000);


                    }
                    else {
                        setTimeout(function () {
                            $("#i_check_otp").addClass("d-none");
                            $("#i_verified_otp").addClass("d-none");
                            $("#span_verify_otp").text("Verify");
                            $("#user_otp").attr('disabled', false);
                            $("#btn_verify_otp").attr('disabled', false);
                            $("#btn_otp").attr('disabled', false);
                            $("#txtName").attr('disabled', false);
                            $("#txtPhone").attr('disabled', false);
                            $("#txtEmail").attr('disabled', false);

                            $("#user_otp-error").removeClass("d-none");
                            $("#user_otp-error").text("Wrong OTP!");
                        }, 1000);
                    }
                },
                complete: function (response) {
                    
                },
                error: function (error) {

          if(!navigator.onLine) swal("You are offline", "", "info");
          else swal("Error!",error.responseText,"error");

                }

            });
        });


        //register tenant
      $("#btnRegister").click(function (e) { 
          e.preventDefault();
          if($("#registerTenant").valid()){
            if (!$("#user_otp-error").hasClass("verified")) {
                swal("Warning!", "Verify your Email first!,", "warning");
            }

            else if(!$("#user-agree").prop('checked')){
                swal("Information!", "Make sure to read and agree the Terms and Conditions", "info");
            }
            
            else{
                
                let d = moment();
                var record = {
                        name: $("#txtName").val(),
                        phone: $("#txtPhone").val(),
                        email: $("#txtEmail").val(),
                        username: $("#txtUsername").val(),
                        password: $("#txtPassword").val(),
                        profileImg: "",
                        date: d.format("YYYY-MM-DD")                        
                };
                
                //console.log(data);
                $.ajax({
                    type: "POST",
                    contentType: "application/json",
                    async: true,
                    url: urlbase + "user/insertNewUser",
                    data:JSON.stringify(record),
                    datatype: "json",
                    beforeSend: function () {
                         $("#saving").modal({
                            show: true,
                            backdrop: 'static',
                            keyboard:false
                        });
                    },
                    success: function (response) {
                        var data = {
                            username:record.username,
                            password:record.password
                        } 
                        data = {username:"",password:""};
                        localStorage.setItem("rup-user",JSON.stringify(data));
                        var flat = localStorage.getItem("flat");
                        if(flat){
                            var to = JSON.parse(flat);
                            window.localStorage.removeItem('flat');
                            window.location=`../find/flat.html?id=${to._id}&propertyFor=${to.status}`
                        }
                        else{
                            window.location = "index.html";
                        }
                        
                        //console.log(response);
                    },
                    error: function (error) {

          if(!navigator.onLine) swal("You are offline", "", "info");
          else swal("Error!",error.responseText,"error");
                        console.log(error);
                    }
                });
            }
            

          }
        
          
          
      });

      