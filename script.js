const states = {
    "AC": "Acre",
    "AL": "Alagoas",
    "AP": "Amapá",
    "AM": "Amazonas",
    "BA": "Bahia",
    "CE": "Ceará",
    "DF": "Distrito Federal",
    "ES": "Espírito Santo",
    "GO": "Goiás",
    "MA": "Maranhão",
    "MT": "Mato Grosso",
    "MS": "Mato Grosso do Sul",
    "MG": "Minas Gerais",
    "PA": "Pará",
    "PB": "Paraíba",
    "PR": "Paraná",
    "PE": "Pernambuco",
    "PI": "Piauí",
    "RJ": "Rio de Janeiro",
    "RN": "Rio Grande do Norte",
    "RS": "Rio Grande do Sul",
    "RO": "Rondônia",
    "RR": "Roraima",
    "SC": "Santa Catarina",
    "SP": "São Paulo",
    "SE": "Sergipe",
    "TO": "Tocantins"
}
var form = $("#form");
var formCep = $("#formCep");
var formAddress = $("#formAddress");
var btnCep = $("#btnCep");
var btnAddress = $("#btnAddress");
var containerMessage = $('#message');
var containerResponseCep = $("#containerResponseCep");
var containerResponseAddress = $("#containerResponseAddress");
var responseContainer = $("#response");

function handleButtonClick(primaryBtn, secondaryBtn, showForm, hiddenForm) {
    if (primaryBtn.hasClass('btn-primary')) {
        primaryBtn.removeClass('btn btn-primary').addClass('btn btn-secondary').prop('disabled', true);
        secondaryBtn.removeClass('btn btn-secondary').addClass('btn btn-primary').prop('disabled', false);
        showForm.show().find('input, select').prop('disabled', false);
        hiddenForm.hide().find('input, select').prop('disabled', true);
        clearResponse();
    }
}

function clearResponse() {
    containerMessage.html('');
    responseContainer.find('input').val('');
    containerResponseCep.hide();
    containerResponseAddress.hide();
    responseContainer.hide();
}

function isset(variable) {
    return typeof variable !== 'undefined' && variable !== null;
}

function validateParams(dataObject) {
    if (isset(dataObject['cep'])) {
        var cep = dataObject['cep'].replace(/\D/g, '');
        var regexCep = /^[0-9]{8}$/;

        if (!regexCep.test(cep)) {
            var message = '<div class="alert alert-warning alert-dismissible fade show" role="alert">'
            + '<strong>CEP inválido!'
            + '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>'
            + '</div>';
            containerMessage.html(message);
            $('#cep').val('').focus();
            return;
        }
            
        url = 'https://viacep.com.br/ws/' + cep + '/json';
        handleRequest(url);
        
    } else if (isset(dataObject['address']) 
        && isset(dataObject['city'])
        && isset(dataObject['state'])) {
            var address = dataObject['address'].replace(/[^a-zA-ZÀ-ÿ0-9\s]/g, '').trim();
            var city = dataObject['city'].replace(/[^a-zA-ZÀ-ÿ0-9\s]/g, '').trim();
            var state = dataObject['state'];
            
            if (!address || address.length < 3) {
                var message = '<div class="alert alert-warning alert-dismissible fade show" role="alert">'
                + '<strong>Endereço inválido!'
                + '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>'
                + '</div>';
                containerMessage.html(message);
                $('#address').val('').focus();
                return;
            }
            if (!city || city.length < 3) {
                var message = '<div class="alert alert-warning alert-dismissible fade show" role="alert">'
                + '<strong>Cidade inválida!'
                + '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>'
                + '</div>';
                containerMessage.html(message);
                $('#city').val('').focus();
                return;
            }

            url = 'https://viacep.com.br/ws/' + state + '/' + city + '/' + address + '/json';
            handleRequest(url);
    }
}

function handleRequest(url) {
    $.ajax({
        url: url,
        success: function(retorno) {
            if (Array.isArray(retorno) && retorno.length > 0) {
                retorno = retorno[0];
            }
            if (isset(retorno.cep) || isset(retorno.logradouro)) {
                if (btnCep.hasClass('btn-primary')) {
                    drawResponse(retorno, 'address');
                } else {
                    drawResponse(retorno, 'cep');
                }
                
            } else {
                var message = '<div class="alert alert-warning alert-dismissible fade show" role="alert">'
                + '<strong>Não foi possível encontrar.'
                + '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>'
                + '</div>';
                containerMessage.html(message);
                return;
            }
            form.find('input').val('');  
        }
    });
}

function drawResponse(response, type) {
    if (type == 'address') {
        $("#responseAddress").val(response.logradouro);
        $("#responseDistrict").val(response.bairro);
        $("#responseCity").val(response.localidade);
        $("#responseState").val(response.uf);
        containerResponseAddress.show();
    } else {
        $("#responseCep").val(response.cep);
        containerResponseCep.show();
    }
    responseContainer.show();
}

form.submit(function(event) {
    event.preventDefault();
    var formData = form.serializeArray();
    var dataObject = {};
    $.each(formData, function(index, field) {
        dataObject[field.name] = field.value;
    });
    validateParams(dataObject);
});

btnCep.on('click', function() {
    handleButtonClick(btnCep, btnAddress, formAddress, formCep);
});

btnAddress.on('click', function() {
    handleButtonClick(btnAddress, btnCep, formCep, formAddress);
});

$(document).ready(function() {  
    formAddress.hide().find('input, select').prop('disabled', true);
    clearResponse();
    $.each(states, function(acronym, name) {
        $('#state').append($('<option>', {
            value: acronym,
            text: name
        }));
    });
})