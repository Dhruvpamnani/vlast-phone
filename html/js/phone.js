var ContactSearchActive = false;
var CurrentFooterTab = "contacts";
var CallData = {};
var ClearNumberTimer = null;
var SelectedSuggestion = null;
var AmountOfSuggestions = 0;

$(document).on('click', '.phone-app-footer-button', function(e){
    e.preventDefault();

    var PressedFooterTab = $(this).data('phonefootertab');

    if (PressedFooterTab !== CurrentFooterTab) {
        var PreviousTab = $(this).parent().find('[data-phonefootertab="'+CurrentFooterTab+'"');

        $('.phone-app-footer').find('[data-phonefootertab="'+CurrentFooterTab+'"').removeClass('phone-selected-footer-tab');
        $(this).addClass('phone-selected-footer-tab');

        $(".phone-"+CurrentFooterTab).hide();
        $(".phone-"+PressedFooterTab).show();

        if (PressedFooterTab == "recent") {
            $.post('http://qb-phone/ClearRecentAlerts');
        } else if (PressedFooterTab == "suggestedcontacts") {
            $.post('http://qb-phone/ClearRecentAlerts');
        }

        CurrentFooterTab = PressedFooterTab;
    }
});

$(document).on("click", "#phone-search-icon", function(e){
    e.preventDefault();

    if (!ContactSearchActive) {
        $("#phone-plus-icon").animate({
            opacity: "0.0",
            "display": "none"
        }, 150, function(){
            $("#contact-search").css({"display":"block"}).animate({
                opacity: "1.0",
            }, 150);
        });
    } else {
        $("#contact-search").animate({
            opacity: "0.0"
        }, 150, function(){
            $("#contact-search").css({"display":"none"});
            $("#phone-plus-icon").animate({
                opacity: "1.0",
                display: "block",
            }, 150);
        });
    }

    ContactSearchActive = !ContactSearchActive;
});

NM.Phone.Functions.SetupRecentCalls = function(recentcalls) {
    $(".phone-recent-calls").html("");

    recentcalls = recentcalls.reverse();

    $.each(recentcalls, function(i, recentCall){
        var FirstLetter = (recentCall.name).charAt(0);
        var TypeIcon = 'fas fa-phone-slash';
        var IconStyle = "color: #e74c3c;";
        if (recentCall.type === "outgoing") {
            TypeIcon = 'fas fa-phone-volume';
            var IconStyle = "color: #2ecc71; font-size: 1.4vh;";
        }
        if (recentCall.anonymous) {
            FirstLetter = "A";
            recentCall.name = "Gizli Numara";
        }
        var elem = `
            <div class="phone-recent-call" id="recent-${i}">
                <div class="phone-recent-call-type">
                    <i class="fas fa-minus-circle" style="color: var(--main-red); font-size: 24px; margin-right: 8px;"></i>
                    <i class="fas fa-phone-volume" style="color: var(--main-light-green); font-size: 16px;"></i>
                </div>
                <div class="phone-recent-call-name-details">
                    <div class="phone-recent-call-name">${recentCall.name}</div>
                    <div class="phone-recent-call-type-text">mobil</div>
                </div>
                <span class="phone-recent-call-time-text">${recentCall.time}</span>
            </div>
        `;
        // var elem = '<div class="phone-recent-call" id="recent-'+i+'"><div class="phone-recent-call-image">'+FirstLetter+'</div> <div class="phone-recent-call-name">'+recentCall.name+'</div> <div class="phone-recent-call-type"><i class="'+TypeIcon+'" style="'+IconStyle+'"></i></div> <div class="phone-recent-call-time">'+recentCall.time+'</div> </div>'

        $(".phone-recent-calls").append(elem);
        $("#recent-"+i).data('recentData', recentCall);
    });
}

$(document).on('click', '.phone-recent-call', function(e){
    e.preventDefault();

    var RecendId = $(this).attr('id');
    var RecentData = $("#"+RecendId).data('recentData');

    cData = {
        number: RecentData.number,
        name: RecentData.name
    }
    $.post('http://qb-phone/CallContact', JSON.stringify({
        ContactData: cData,
        Anonymous: NM.Phone.Data.AnonymousCall,
    }), function(status){
        if (cData.number !== NM.Phone.Data.PlayerData.charinfo.phone) {
            if (status.CanCall) {
                if (!status.InCall) {
                    if (NM.Phone.Data.AnonymousCall) {
                        NM.Phone.Notifications.Add("phone", "Telefon", "Anonim bir arama başlattınız");
                    }
                    $(".phone-call-outgoing").css({"display":"block"});
                    $(".phone-call-incoming").css({"display":"none"});
                    $(".phone-call-ongoing").css({"display":"none"});
                    $(".phone-call-outgoing-caller").html(cData.name);
                    NM.Phone.Functions.HeaderTextColor("white", 400);
                    NM.Phone.Animations.TopSlideUp('.phone-application-container', 400, -160);
                    setTimeout(function(){
                        $(".phone-app").css({"display":"none"});
                        NM.Phone.Animations.TopSlideDown('.phone-application-container', 400, 0);
                        NM.Phone.Functions.ToggleApp("phone-call", "block");
                    }, 450);

                    CallData.name = cData.name;
                    CallData.number = cData.number;
                
                    NM.Phone.Data.currentApplication = "phone-call";
                } else {
                    NM.Phone.Notifications.Add("phone", "Telefon", "Şuanda zaten arama yapıyorsun");
                }
            } else {
                NM.Phone.Notifications.Add("phone", "Telefon", "Kişi şuanda başkasıyla görüşüyor");
            }
        } else {
            NM.Phone.Notifications.Add("phone", "Telefon", "Kendi numaranı arayamazsın");
        }
    });
});

$(document).on('click', ".phone-keypad-key-call", function(e){
    e.preventDefault();

    var InputNum = toString($(".phone-keypad-input").text());

    cData = {
        number: InputNum,
        name: InputNum,
    }

    $.post('http://qb-phone/CallContact', JSON.stringify({
        ContactData: cData,
        Anonymous: NM.Phone.Data.AnonymousCall,
    }), function(status){
        if (cData.number !== NM.Phone.Data.PlayerData.charinfo.phone) {
            if (status.CanCall) {
                if (!status.InCall) {
                    $(".phone-call-outgoing").css({"display":"block"});
                    $(".phone-call-incoming").css({"display":"none"});
                    $(".phone-call-ongoing").css({"display":"none"});
                    $(".phone-call-outgoing-caller").html(cData.name);
                    NM.Phone.Functions.HeaderTextColor("white", 400);
                    NM.Phone.Animations.TopSlideUp('.phone-application-container', 400, -160);
                    setTimeout(function(){
                        $(".phone-app").css({"display":"none"});
                        NM.Phone.Animations.TopSlideDown('.phone-application-container', 400, 0);
                        NM.Phone.Functions.ToggleApp("phone-call", "block");
                    }, 450);

                    CallData.name = cData.name;
                    CallData.number = cData.number;
                
                    NM.Phone.Data.currentApplication = "phone-call";
                } else {
                    NM.Phone.Notifications.Add("phone", "Telefon", "Zaten bir aramadasın.");
                }
            } else {
                NM.Phone.Notifications.Add("phone", "Telefon", "Kişi şuanda başkasıyla görüşüyor.");
            }
        } else {
            NM.Phone.Notifications.Add("phone", "Telefon", "Kendi numaranı arayamazsın.");
        }
    });
});

let ContactLetters = ["#"];

NM.Phone.Functions.LoadContacts = function(myContacts) {
    var ContactsObject = $(".phone-contact-list");
    $(ContactsObject).html("");
    var TotalContacts = 0;
    ContactLetters = [];

    $(".phone-contacts").hide();
    $(".phone-recent").hide();
    $(".phone-keypad").hide();

    $(".phone-"+CurrentFooterTab).show();

    $("#contact-search").on("keyup", function() {
        var value = $(this).val().toLowerCase();
        $(".phone-contact-list .phone-contact").filter(function() {
          $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
        });
    });

    if (myContacts !== null) {
        $(ContactsObject).append(`<div class="phone-letter-hr"><span>#</span></div>`);

        $.each(myContacts, function(i, contact){
            if (!ContactLetters.some(x => x == contact.name[0].toUpperCase())) {
                let Letter = contact.name[0].toUpperCase()
                let LetterElement = `<div class="phone-letter-hr"><span>${Letter}</span></div>`;

                if (!Number(contact.name[0])) {
                    ContactLetters.push(contact.name[0].toUpperCase());
                    $(ContactsObject).append(LetterElement);
                }
            }

            // var ContactElement = '<div class="phone-contact" data-contactid="'+i+'"><div class="phone-contact-firstletter" style="background-color: #e74c3c;">'+((contact.name).charAt(0)).toUpperCase()+'</div><div class="phone-contact-name">'+contact.name+'</div><div class="phone-contact-actions"><i class="fas fa-sort-down"></i></div><div class="phone-contact-action-buttons"> <i class="fas fa-phone-volume" id="phone-start-call"></i> <i class="whatsapp" id="new-chat-phone" style="font-size: 2.5vh;"></i> <i class="fas fa-user-edit" id="edit-contact"></i> </div></div>'
            var ContactElement = '<div class="phone-contact" data-contactid="'+i+'"><div class="phone-contact-firstletter" style="background-color: #e74c3c;">'+((contact.name).charAt(0)).toUpperCase()+'</div><div class="phone-contact-name">'+contact.name+'</div></div>'
            if (contact.status) {
                // ContactElement = '<div class="phone-contact" data-contactid="'+i+'"><div class="phone-contact-firstletter" style="background-color: #2ecc71;">'+((contact.name).charAt(0)).toUpperCase()+'</div><div class="phone-contact-name">'+contact.name+'</div><div class="phone-contact-actions"><i class="fas fa-sort-down"></i></div><div class="phone-contact-action-buttons"> <i class="fas fa-phone-volume" id="phone-start-call"></i> <i class="whatsapp" id="new-chat-phone" style="font-size: 2.5vh;"></i> <i class="fas fa-user-edit" id="edit-contact"></i> </div></div>'
                ContactElement = '<div class="phone-contact" data-contactid="'+i+'"><div class="phone-contact-firstletter" style="background-color: #2ecc71;">'+((contact.name).charAt(0)).toUpperCase()+'</div><div class="phone-contact-name">'+contact.name+'</div></div>'
            }
            TotalContacts = TotalContacts + 1
            $(ContactsObject).append(ContactElement);
            $("[data-contactid='"+i+"']").data('contactData', contact);
        });
        $("#total-contacts").text(TotalContacts+ " Kişi");
    } else {
        $("#total-contacts").text("Rehberin Boş");
    }
};

$(document).on('click', '#phone-contact-message', function(e){
    var ContactId = $(this).data('contactid');
    var ContactData = $("[data-contactid='"+ContactId+"']").data('contactData');

    if (ContactData.number !== NM.Phone.Data.PlayerData.charinfo.phone) {
        $.post('http://qb-phone/GetWhatsappChats', JSON.stringify({}), function(chats){
            NM.Phone.Functions.LoadWhatsappChats(chats);
        });
    
        $('.phone-application-container').animate({
            top: -160+"%"
        });
        NM.Phone.Functions.HeaderTextColor("white", 400);
        setTimeout(function(){
            $('.phone-application-container').animate({
                top: 0+"%"
            });
    
            NM.Phone.Functions.ToggleApp("phone", "none");
            NM.Phone.Functions.ToggleApp("whatsapp", "block");
            NM.Phone.Data.currentApplication = "whatsapp";
        
            $.post('http://qb-phone/GetWhatsappChat', JSON.stringify({phone: ContactData.number}), function(chat){
                NM.Phone.Functions.SetupChatMessages(chat, {
                    name: ContactData.name,
                    number: ContactData.number
                });
            });
        
            $('.whatsapp-openedchat-messages').animate({scrollTop: 9999}, 150);
            $(".whatsapp-openedchat").css({"display":"flex"});
            $(".whatsapp-openedchat").css({left: 0+"vh"});
            $(".whatsapp-chats").animate({right: 30+"vh"},100, function(){
                $(".whatsapp-chats").css({"display":"none"});
            });
        }, 400)
    } else {
        NM.Phone.Notifications.Add("contacts", "Rehber", "idek", "default", 3500);
    }
});

var CurrentEditContactData = {}

$(document).on('click', '#edit-contact', function(e){
    e.preventDefault();
    var ContactId = $(this).data('contactid');
    var ContactData = $("[data-contactid='"+ContactId+"']").data('contactData');

    CurrentEditContactData.name = ContactData.name
    CurrentEditContactData.number = ContactData.number

    $(".phone-edit-contact-image-source").prop("src", ContactData.image);
    $(".phone-edit-contact-name").val(ContactData.name);
    $(".phone-edit-contact-number").val(ContactData.number);
    if (ContactData.iban != null && ContactData.iban != undefined) {
        $(".phone-edit-contact-iban").val(ContactData.iban);
        CurrentEditContactData.iban = ContactData.iban
    } else {
        $(".phone-edit-contact-iban").val("");
        CurrentEditContactData.iban = "";
    }

    $(".phone-edit-contact").css("display", "block");
    $(".phone-edit-contact").animate({"right": "0%"}, 200);
});

$(document).on('click', '.phone-contact', function(e){
    e.preventDefault();
    var ContactId = $(this).data('contactid');
    var ContactData = $("[data-contactid='"+ContactId+"']").data('contactData');
    $("#phone-contact-call").data('contactid', ContactId);
    $("#phone-contact-message").data('contactid', ContactId);
    $("#edit-contact").data('contactid', ContactId);

    CurrentEditContactData.name = ContactData.name
    CurrentEditContactData.number = ContactData.number

    // $(".phone-contact-details-header").text(ContactData.name+" edit")
    $(".phone-contact-details-user-image").prop("src", `${ContactData.image}`);
    $(".phone-contact-details-user-name").text(ContactData.name);
    $(".phone-contact-details-phone-text").text(ContactData.number);
    $(".phone-contact-details-iban-text").text(ContactData.iban);
    $("#phone-contact-details-note-field").val(ContactData.note)
    if (ContactData.iban != null && ContactData.iban != undefined) {
        $(".phone-edit-contact-iban").val(ContactData.iban);
        CurrentEditContactData.iban = ContactData.iban;
    } else {
        $(".phone-edit-contact-iban").val("");
        CurrentEditContactData.iban = "";
    }

    NM.Phone.Animations.SlideLeft(".phone-contact-details", 200, 0);
});

$(document).on('click', '#phone-add-contact-take-image', function(e) {
    e.preventDefault();

    $.post('http://qb-phone/Close', JSON.stringify({}));
    $("body").css("display", "none");

    $.post('http://qb-phone/TakeImage', JSON.stringify({}), function(url) {
        $("body").css("display", "block");

        if (url !== "") {
            $(".phone-add-contact-image-source").prop("src", url);
        }
    });
});

$(document).on('click', '#phone-edit-contact-take-image', function(e) {
    e.preventDefault();

    $.post('http://qb-phone/Close', JSON.stringify({}));
    $("body").css("display", "none");

    $.post('http://qb-phone/TakeImage', JSON.stringify({}), function(url) {
        $("body").css("display", "block");

        if (url !== "") {
            $(".phone-edit-contact-image-source").prop("src", url);
        }
    });
});

$(document).on('click', '#edit-contact-save', function(e){
    e.preventDefault();

    var ContactImage = $(".phone-edit-contact-image-source").prop("src");
    var ContactName = $(".phone-edit-contact-name").val();
    var ContactNumber = $(".phone-edit-contact-number").val();
    var ContactIban = $(".phone-edit-contact-iban").val();

    if (ContactName != "" && ContactNumber != "") {
        $.post('http://qb-phone/EditContact', JSON.stringify({
            CurrentContactName: ContactName,
            CurrentContactNumber: ContactNumber,
            CurrentContactIban: ContactIban,
            CurrentContactImage: ContactImage,
            OldContactName: CurrentEditContactData.name,
            OldContactNumber: CurrentEditContactData.number,
            OldContactIban: CurrentEditContactData.iban,
        }), function(PhoneContacts){
            NM.Phone.Functions.LoadContacts(PhoneContacts);
        });

        $(".phone-contact-details-user-image").prop("src", ContactImage);
        $(".phone-contact-details-user-name").text(ContactName);
        $(".phone-contact-details-phone-text").text(ContactNumber);
        $(".phone-contact-details-iban-text").text(ContactIban);

        $(".phone-edit-contact").animate({"right": "100%"}, 250, function() {
            $(".phone-edit-contact-number").val("");
            $(".phone-edit-contact-name").val("");
            $(".phone-edit-contact").css("display", "none");
        });
    } else {
        NM.Phone.Notifications.Add("contacts", "Kişiler", "Boş alanları doldurun");
    }
});

$(document).on('click', '#phone-delete-contact', function(e){
    e.preventDefault();

    var ContactName = $(".phone-edit-contact-name").val();
    var ContactNumber = $(".phone-edit-contact-number").val();
    var ContactIban = $(".phone-edit-contact-iban").val();

    $.post('http://qb-phone/DeleteContact', JSON.stringify({
        CurrentContactName: ContactName,
        CurrentContactNumber: ContactNumber,
        CurrentContactIban: ContactIban,
    }), function(PhoneContacts){
        NM.Phone.Functions.LoadContacts(PhoneContacts);
    });

    $(".phone-contact-details").css({"right": "-100%", "display": "none"});
    $(".phone-edit-contact").animate({"right": "-100%"}, 250, function() {
        $(".phone-edit-contact").css("display", "none");
        $(".phone-edit-contact-number").val("");
        $(".phone-edit-contact-name").val("");
        $(".phone-edit-contact-iban").val("");
    });
});

$(document).on('click', '#edit-contact-cancel', function(e){
    e.preventDefault();

    $(".phone-edit-contact").animate({"right": "-100%"}, 250, function() {
        $(".phone-edit-contact").css("display", "none");
    });
    setTimeout(function(){
        $(".phone-edit-contact-image-source").prop("src", "nui://qb-phone/html/img/default.png")
        $(".phone-edit-contact-number").val("");
        $(".phone-edit-contact-name").val("");
        $(".phone-edit-contact-iban").val("");
    }, 250)
});

$(document).on('click', '.phone-keypad-key', function(e){
    e.preventDefault();

    var PressedButton = $(this).data('keypadvalue');

    if (PressedButton == "#" || !isNaN(PressedButton)) {
        if ($("#phone-keypad-input").text() == "Temizlendi") {
            $("#phone-keypad-input").text("");
        }
        var keyPadHTML = $("#phone-keypad-input").text();
        $("#phone-keypad-input").text(keyPadHTML + PressedButton)
    // } else if (PressedButton == "#") {
    //     var keyPadHTML = $("#phone-keypad-input").text();
    //     $("#phone-keypad-input").text(keyPadHTML + PressedButton)
    } else if (PressedButton == "*") {
        if (ClearNumberTimer == null) {
            $("#phone-keypad-input").text("Temizlendi")
            ClearNumberTimer = setTimeout(function(){
                if ($("#phone-keypad-input").text() == "Temizlendi") {
                    $("#phone-keypad-input").text("");
                }
                ClearNumberTimer = null;
            }, 750);
        }
    }
})

var OpenedContact = null;

$(document).on('click', '.phone-contact-actions', function(e){
    e.preventDefault();

    var FocussedContact = $(this).parent();
    var ContactId = $(FocussedContact).data('contactid');

    if (OpenedContact === null) {
        $(FocussedContact).animate({
            "height":"12vh"
        }, 150, function(){
            $(FocussedContact).find('.phone-contact-action-buttons').fadeIn(100);
        });
        OpenedContact = ContactId;
    } else if (OpenedContact == ContactId) {
        $(FocussedContact).find('.phone-contact-action-buttons').fadeOut(100, function(){
            $(FocussedContact).animate({
                "height":"4.5vh"
            }, 150);
        });
        OpenedContact = null;
    } else if (OpenedContact != ContactId) {
        var PreviousContact = $(".phone-contact-list").find('[data-contactid="'+OpenedContact+'"]');
        $(PreviousContact).find('.phone-contact-action-buttons').fadeOut(100, function(){
            $(PreviousContact).animate({
                "height":"4.5vh"
            }, 150);
            OpenedContact = ContactId;
        });
        $(FocussedContact).animate({
            "height":"12vh"
        }, 150, function(){
            $(FocussedContact).find('.phone-contact-action-buttons').fadeIn(100);
        });
    }
});


$(document).on('click', '#phone-plus-icon', function(e){
    e.preventDefault();

    NM.Phone.Animations.SlideLeft(".phone-add-contact", 200, 0);
});

$(document).on('click', '#add-contact-save', function(e){
    e.preventDefault();

    var ContactName = $(".phone-add-contact-name").val();
    var ContactNumber = $(".phone-add-contact-number").val();
    var ContactIban = $(".phone-add-contact-iban").val();
    var ContactImage = $(".phone-add-contact-image-source").prop("src");

    if (ContactName != "" && ContactNumber != "") {
        $.post('http://qb-phone/AddNewContact', JSON.stringify({
            ContactName: ContactName,
            ContactNumber: ContactNumber,
            ContactIban: ContactIban,
            ContactImage: ContactImage
        }), function(PhoneContacts){
            NM.Phone.Functions.LoadContacts(PhoneContacts);
        });
        NM.Phone.Animations.SlideRight(".phone-add-contact", 250, -100);
        setTimeout(function(){
            $(".phone-add-contact-number").val("");
            $(".phone-add-contact-name").val("");
            $(".phone-add-contact-iban").val("");
            $(".phone-add-contact-image-source").prop("src", "nui://qb-phone/html/img/default.png");
        }, 250)

        if (SelectedSuggestion !== null) {
            $.post('http://qb-phone/RemoveSuggestion', JSON.stringify({
                data: $(SelectedSuggestion).data('SuggestionData')
            }));
            $(SelectedSuggestion).remove();
            SelectedSuggestion = null;
            var amount = parseInt(AmountOfSuggestions);
            if ((amount - 1) === 0) {
                amount = 0
            }
            $(".amount-of-suggested-contacts").html(amount + " önerilen kişi");
        }
    } else {
        NM.Phone.Notifications.Add("contacts", "Kişiler", "Boş alanları doldurun");
    }
});

$(document).on('click', '#add-contact-cancel', function(e){
    e.preventDefault();

    NM.Phone.Animations.SlideRight(".phone-add-contact", 250, -100);
    setTimeout(function(){
        $(".phone-add-contact-number").val("");
        $(".phone-add-contact-name").val("");
        $(".phone-add-contact-iban").val("");
        $(".phone-add-contact-image-source").prop("src", "nui://qb-phone/html/img/default.png");
    }, 250)
});
$(document).on('click', '#contact-details-cancel', function(e){
    e.preventDefault();

    NM.Phone.Animations.SlideRight(".phone-contact-details", 250, -100);
    setTimeout(function(){
        $(".phone-contact-details-fields-field-value").val("");
        $(".phone-contact-details-user-name").val("");
        $(".phone-add-contact-iban").val("");
        $(".phone-contact-details-user-image").prop("src", "nui://qb-phone/html/img/default.png");
    }, 250)
});

$(document).on('click', '#phone-contact-call', function(e){
    e.preventDefault();   
    
    var ContactId = $(this).data('contactid');
    var ContactData = $("[data-contactid='"+ContactId+"']").data('contactData');
    
    SetupCall(ContactData);
});

SetupCall = function(cData) {
    var retval = false;
    $.post('http://qb-phone/CallContact', JSON.stringify({
        ContactData: cData,
        Anonymous: NM.Phone.Data.AnonymousCall,
    }), function(status){
        if (cData.number !== NM.Phone.Data.PlayerData.charinfo.phone) {
            console.log(status);
            if(!status.IsOnline) {
                NM.Phone.Notifications.Add("phone", "Telefon", "Aradığınzı kişiye şuanda ulaşılamıyor");
                return;
            }
            
            if (status.CanCall) {
                if (!status.InCall) {
                    $(".phone-call-outgoing").css({"display":"block"});
                    $(".phone-call-incoming").css({"display":"none"});
                    $(".phone-call-ongoing").css({"display":"none"});
                    $(".phone-call-outgoing-caller").html(cData.name);
                    NM.Phone.Functions.HeaderTextColor("white", 400);
                    NM.Phone.Animations.TopSlideUp('.phone-application-container', 400, -160);
                    setTimeout(function(){
                        $(".phone-app").css({"display":"none"});
                        NM.Phone.Animations.TopSlideDown('.phone-application-container', 400, 0);
                        NM.Phone.Functions.ToggleApp("phone-call", "block");
                    }, 450);

                    CallData.name = cData.name;
                    CallData.number = cData.number;
                
                    NM.Phone.Data.currentApplication = "phone-call";
                } else {
                    NM.Phone.Notifications.Add("phone", "Telefon", "Şuanda zaten başkasıyla konuşuyorsun");
                }
            } else {
                NM.Phone.Notifications.Add("phone", "Telefon", "Kişi şuanda başkasıyla görüşüyor");
            }
        } else {
            NM.Phone.Notifications.Add("phone", "Telefon", "Kendinizi arayamassınız");
        }
    });
}

CancelOutgoingCall = function() {
    if (NM.Phone.Data.currentApplication == "phone-call") {
        NM.Phone.Animations.TopSlideUp('.phone-application-container', 400, -160);
        NM.Phone.Animations.TopSlideUp('.'+NM.Phone.Data.currentApplication+"-app", 400, -160);
        setTimeout(function(){
            NM.Phone.Functions.ToggleApp(NM.Phone.Data.currentApplication, "none");
        }, 400)
        NM.Phone.Functions.HeaderTextColor("white", 300);
    
        NM.Phone.Data.CallActive = false;
        NM.Phone.Data.currentApplication = null;
    }
}

$(document).on('click', '#outgoing-cancel', function(e){
    e.preventDefault();

    $.post('http://qb-phone/CancelOutgoingCall');
});

$(document).on('click', '#incoming-deny', function(e){
    e.preventDefault();

    $.post('http://qb-phone/DenyIncomingCall');
});

$(document).on('click', '#ongoing-cancel', function(e){
    e.preventDefault();
    
    $.post('http://qb-phone/CancelOngoingCall');
});

IncomingCallAlert = function(CallData, Canceled, AnonymousCall) {
    if (!Canceled) {
        if (!NM.Phone.Data.CallActive) {
            NM.Phone.Animations.TopSlideUp('.phone-application-container', 400, -160);
            NM.Phone.Animations.TopSlideUp('.'+ NM.Phone.Data.currentApplication + "-app", 400, -160);
            setTimeout(function(){
                var Label = ""+CallData.name+" Seni arıyor!"
                if (AnonymousCall) {
                    Label = "You will be called by an anonymous number"
                }
                $(".call-notifications-title").html("Gelen çağrı");
                $(".call-notifications-content").html(Label);
                $(".call-notifications").css({"display":"block"});
                $(".call-notifications").animate({
                    right: 5+"vh"
                }, 400);
                $(".phone-call-outgoing").css({"display":"none"});
                $(".phone-call-incoming").css({"display":"block"});
                $(".phone-call-ongoing").css({"display":"none"});
                $(".phone-call-incoming-caller").html(CallData.name);
                $(".phone-app").css({"display":"none"});
                NM.Phone.Functions.HeaderTextColor("white", 400);
                $("."+NM.Phone.Data.currentApplication+"-app").css({"display":"none"});
                $(".phone-call-app").css({"display":"block"});
                setTimeout(function(){
                    NM.Phone.Animations.TopSlideDown('.phone-application-container', 400, 0);
                }, 400);
            }, 400);
        
            NM.Phone.Data.currentApplication = "phone-call";
            NM.Phone.Data.CallActive = true;
        }
        setTimeout(function(){
            $(".call-notifications").addClass('call-notifications-shake');
            setTimeout(function(){
                $(".call-notifications").removeClass('call-notifications-shake');
            }, 1000);
        }, 400);
    } else {
        $(".call-notifications").animate({
            right: -35+"vh"
        }, 400);
        NM.Phone.Animations.TopSlideUp('.phone-application-container', 400, -160);
        NM.Phone.Animations.TopSlideUp('.'+NM.Phone.Data.currentApplication+"-app", 400, -160);
        setTimeout(function(){
            $("."+NM.Phone.Data.currentApplication+"-app").css({"display":"none"});
            $(".phone-call-outgoing").css({"display":"none"});
            $(".phone-call-incoming").css({"display":"none"});
            $(".phone-call-ongoing").css({"display":"none"});
            $(".call-notifications").css({"display":"block"});
        }, 400)
        NM.Phone.Functions.HeaderTextColor("white", 300);
        NM.Phone.Data.CallActive = false;
        NM.Phone.Data.currentApplication = null;
    }
}

// IncomingCallAlert = function(CallData, Canceled) {
//     if (!Canceled) {
//         if (!NM.Phone.Data.CallActive) {
//             $(".call-notifications-title").html("Inkomende Oproep");
//             $(".call-notifications-content").html("Je hebt een inkomende oproep van "+CallData.name);
//             $(".call-notifications").css({"display":"block"});
//             $(".call-notifications").animate({
//                 right: 5+"vh"
//             }, 400);
//             $(".phone-call-outgoing").css({"display":"none"});
//             $(".phone-call-incoming").css({"display":"block"});
//             $(".phone-call-ongoing").css({"display":"none"});
//             $(".phone-call-incoming-caller").html(CallData.name);
//             $(".phone-app").css({"display":"none"});
//             NM.Phone.Functions.HeaderTextColor("white", 400);
//             NM.Phone.Animations.TopSlideUp('.phone-application-container', 400, -160);
//             $(".phone-call-app").css({"display":"block"});
//             setTimeout(function(){
//                 NM.Phone.Animations.TopSlideDown('.phone-application-container', 400, 0);
//             }, 450);
        
//             NM.Phone.Data.currentApplication = "phone-call";
//             NM.Phone.Data.CallActive = true;
//         }
//         setTimeout(function(){
//             $(".call-notifications").addClass('call-notifications-shake');
//             setTimeout(function(){
//                 $(".call-notifications").removeClass('call-notifications-shake');
//             }, 1000);
//         }, 400);
//     } else {
//         $(".call-notifications").animate({
//             right: -35+"vh"
//         }, 400);
//         NM.Phone.Animations.TopSlideUp('.phone-application-container', 400, -160);
//         NM.Phone.Animations.TopSlideUp('.'+NM.Phone.Data.currentApplication+"-app", 400, -160);
//         setTimeout(function(){
//             NM.Phone.Functions.ToggleApp(NM.Phone.Data.currentApplication, "none");
//             $(".phone-call-outgoing").css({"display":"none"});
//             $(".phone-call-incoming").css({"display":"none"});
//             $(".phone-call-ongoing").css({"display":"none"});
//             $(".call-notifications").css({"display":"block"});
//         }, 400)
//         NM.Phone.Functions.HeaderTextColor("white", 300);
    
//         NM.Phone.Data.CallActive = false;
//         NM.Phone.Data.currentApplication = null;
//     }
// }

NM.Phone.Functions.SetupCurrentCall = function(cData) {
    if (cData.InCall) {
        CallData = cData;
        $(".phone-currentcall-container").css({"display":"block"});

        if (cData.CallType == "incoming") {
            $(".phone-currentcall-title").html("Gelen Arama");
        } else if (cData.CallType == "outgoing") {
            $(".phone-currentcall-title").html("Giden Arama");
        } else if (cData.CallType == "ongoing") {
            $(".phone-currentcall-title").html("Çağrı ("+cData.CallTime+")");
        }

        $(".phone-currentcall-contact").html(cData.TargetData.name);
    } else {
        $(".phone-currentcall-container").css({"display":"none"});
    }
}

$(document).on('click', '.phone-currentcall-container', function(e){
    e.preventDefault();

    if (CallData.CallType == "incoming") {
        $(".phone-call-incoming").css({"display":"block"});
        $(".phone-call-outgoing").css({"display":"none"});
        $(".phone-call-ongoing").css({"display":"none"});
    } else if (CallData.CallType == "outgoing") {
        $(".phone-call-incoming").css({"display":"none"});
        $(".phone-call-outgoing").css({"display":"block"});
        $(".phone-call-ongoing").css({"display":"none"});
    } else if (CallData.CallType == "ongoing") {
        $(".phone-call-incoming").css({"display":"none"});
        $(".phone-call-outgoing").css({"display":"none"});
        $(".phone-call-ongoing").css({"display":"block"});
    }
    $(".phone-call-ongoing-caller").html(CallData.name);

    NM.Phone.Functions.HeaderTextColor("white", 500);
    NM.Phone.Animations.TopSlideDown('.phone-application-container', 500, 0);
    NM.Phone.Animations.TopSlideDown('.phone-call-app', 500, 0);
    NM.Phone.Functions.ToggleApp("phone-call", "block");
                
    NM.Phone.Data.currentApplication = "phone-call";
});

$(document).on('click', '#incoming-answer', function(e){
    e.preventDefault();

    $.post('http://qb-phone/AnswerCall');
});

NM.Phone.Functions.AnswerCall = function(CallData) {
    $(".phone-call-incoming").css({"display":"none"});
    $(".phone-call-outgoing").css({"display":"none"});
    $(".phone-call-ongoing").css({"display":"block"});
    $(".phone-call-ongoing-caller").html(CallData.TargetData.name);

    NM.Phone.Functions.Close();
}

NM.Phone.Functions.SetupSuggestedContacts = function(Suggested) {
    $(".suggested-contacts").html("");
    AmountOfSuggestions = Suggested.length;
    if (AmountOfSuggestions > 0) {
        $(".amount-of-suggested-contacts").html(AmountOfSuggestions + " önerilen kişi");
        Suggested = Suggested.reverse();
        $.each(Suggested, function(index, suggest){
            var elem = '<div class="suggested-contact" id="suggest-'+index+'"> <i class="fas fa-exclamation-circle"></i> <span class="suggested-name">'+suggest.name[0]+' '+suggest.name[1]+' &middot; <span class="suggested-number">'+suggest.number+'</span></span> <i class="fas fa-chevron-right"></i></div>';
            $(".suggested-contacts").append(elem);
            $("#suggest-"+index).data('SuggestionData', suggest);
        });
    } else {
        $(".amount-of-suggested-contacts").html("0 kişi");
    }
}

$(document).on('click', '.suggested-contact', function(e){
    e.preventDefault();

    var SuggestionData = $(this).data('SuggestionData');
    SelectedSuggestion = this;

    $(".phone-add-contact").css("display", "block");
    setTimeout(() => {
        $(".phone-add-contact").animate({"right": "0vh"}, 300);

        $(".phone-add-contact-name").val(SuggestionData.name[0] + " " + SuggestionData.name[1]);
        $(".phone-add-contact-number").val(SuggestionData.number);
        $(".phone-add-contact-iban").val(SuggestionData.bank);
    }, 300);

    // NM.Phone.Animations.TopSlideDown(".phone-add-contact", 200, 0);
    
});

$("#phone-contact-details-note-field").focusout(function() {
    var ContactName = $(".phone-contact-details-user-name").text();
    var ContactNumber = $(".phone-contact-details-phone-text").text();
    var ContactNote = $("#phone-contact-details-note-field").val();

    $.post('http://qb-phone/EditContactNote', JSON.stringify({
        ContactName: ContactName,
        ContactNumber: ContactNumber,
        ContactNote: ContactNote
    }), function(PhoneContacts){
        NM.Phone.Functions.LoadContacts(PhoneContacts);
        NM.Phone.Notifications.Add("contacts", "Rehber", "Kişi notu kaydedildi", "var(--main-light-green)");
    });
});