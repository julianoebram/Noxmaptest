   

// Instantiate a map and platform object:
var platform = new H.service.Platform({
    'apikey': 'NjaT39BXLO-MDpzcMgBkKMtC4HY-8gjngmrgsQ8hTrw'
  });

 
 

  // Retrieve the target element for the map:
  var targetElement = document.getElementById('mapContainer');
  
  // Get the default map types from the platform object:
  var defaultLayers = platform.createDefaultLayers();
  
  // Instantiate the map:
  var map = new H.Map(
    document.getElementById('mapContainer'),
    defaultLayers.vector.normal.map,
    {
      zoom: 5,
      center: { lat: -8.3678162, lng: -35.0315702 }
    });

  // Create the default UI:
    var ui = H.ui.UI.createDefault(map, defaultLayers, 'pt-BR');


  // MapEvents enables the event system
    // Behavior implements default interactions for pan/zoom (also on mobile touch environments)
      var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));


  // Create the parameters for the routing request:
      //OBS: Informações da Viagem com uma unica parada funciona, com duas não, aplicar multivalue pode resolver [Resolveu]
             var routingParameters = {
                'routingMode': 'fast',
                'transportMode': 'truck',

                // The start point of the route:
                'origin': '-8.3678162,-35.0315702',
               
              // Passagem por Caruaru - PE e Montes Claros - MG:
                //'via': ['-8.285,-35.9702','-16.747762,-43.884478'],
                'via': new H.service.Url.MultiValueQueryParameter( ['-8.0837,-34.9713','-8.285,-35.9702','-16.747762,-43.884478'] ),
                // The end point of the route:
                'destination': '-23.1019916,-46.9665265',

                // Include the route shape in the response
               'return': 'polyline',
                
              };
         
// Define a callback function to process the routing response:
  var onResult = function(result) {
    // ensure that at least one route was found
    if (result.routes.length) {
      result.routes[0].sections.forEach((section) => {
           // Create a linestring to use as a point source for the route line
          let linestring = H.geo.LineString.fromFlexiblePolyline(section.polyline);
  
          // Create a polyline to display the route:
          let routeLine = new H.map.Polyline(linestring, {
            style: { strokeColor: 'green', lineWidth: 3,},
            arrows: { fillColor: '#3742fa', frequency: 2, width: 0.8, length: 0.7, height: 2}
          });
          var routeArrows = new H.map.Polyline(linestring, {
            style: {
              lineWidth: 10,
              fillColor: 'black',
              strokeColor: 'green',
              lineDash: [0, 2],
              lineTailCap: 'arrow-tail',
              lineHeadCap: 'arrow-head' }
            })
          
          // Create a marker for the start point:
          let startMarker = new H.map.Marker(section.departure.place.location,);
          // Create a marker for the end point:
          let endMarker = new H.map.Marker(section.arrival.place.location);
  
          // Add the route polyline and the two markers to the map:
          map.addObjects([routeLine,routeArrows]);
          
          // Set the map's viewport to make the whole route visible:
          map.getViewModel().setLookAtData({bounds: routeLine.getBoundingBox()});
      });
      
    }
  };
 

  // Create a marker icon from an image URL:
    var icon1 = new H.map.Icon('imagens/house.png');
    var icon2 = new H.map.Icon('imagens/end.png');

  // Create a marker using the previously instantiated icon:
    var marker1 = new H.map.Marker({ lat: -8.3678162, lng: -35.0315702}, { icon: icon1 });
    var marker2 = new H.map.Marker({ lat: -23.1019916, lng: -46.9665265}, { icon: icon2 });

  // Add the marker to the map:
    map.addObject(marker1);
    map.addObject(marker2);

  // Get an instance of the routing service version 8:
    var router = platform.getRoutingService(null, 8);
  
  // Call calculateRoute() with the routing parameters,
  // the callback and an error callback function (called if a
  // communication error occurs):
    router.calculateRoute(routingParameters, onResult,
      function(error) {
        alert(error.message);
      });
    
  //Rota percorrida
  fetch('rotas.json')
    .then(response => response.json())
    .then(data => {
      console.log(data);
      // Definir a variável rotaVeiculo com os dados do arquivo JSON
      var rotaVeiculo = data;

      // Adicionar a rota ao mapa
      var lineString = new H.geo.LineString();
      rotaVeiculo.forEach(function(coord) {
        lineString.pushLatLngAlt(coord.lat, coord.lng);
      });
      
      var polyline = new H.map.Polyline(lineString, {
        style: { strokeColor: '#c82124', lineWidth: 10,},
        arrows: { fillColor: '#3742fa', frequency: '2', height: '2.7', width: '2.7'}
      });
    
      map.addObject(polyline);
    
    });

  //áreas de Risco
    var riskCircleStyle = {
      strokeColor: 'rgba(255, 0, 0, 0.4)',
      fillColor: 'rgba(255, 0, 0, 0.2)',
      lineWidth: 1,
    }
  // Instantiate a circle 1 
  var circleLouveira = new H.map.Circle({lat: -23.089533, lng: -46.949870}, 200000, {
    style:riskCircleStyle});


  // Instantiate a circle 2 object 
  var circleIpojuca = new H.map.Circle({lat: -8.398104, lng: -35.061195}, 50000, {
  style:riskCircleStyle});


  //áreas Seguras
  var safeCircleStyle = {
    strokeColor: 'green',
    fillColor: 'rgba(0, 255, 0, 0.4)',
    lineWidth: 1,
  }
  // Instantiate a circle 1 
  var circleIpojucaSafe = new H.map.Circle({lat: -8.367838, lng: -35.03406}, 1000, {
  style:safeCircleStyle});




  // Add the circles to the map:
  map.addObject(circleIpojucaSafe);
  map.addObject(circleIpojuca);
  map.addObject(circleLouveira);

  //Info dos Circles

  // Adicione um evento de clique ao círculo
  circleLouveira.addEventListener('tap', function (evt) {
    // Obtém as coordenadas do local do clique
    var position = map.screenToGeo(evt.currentPointer.viewportX, evt.currentPointer.viewportY);
    
    // Cria um conteúdo HTML para a info bubble
    var content = '<div><h4>AREA DE RISCO UNILEVER LOUVEIRA 200KM</h4><p>cidade:LOUVEIRA/SP<br>endereco:KM 0,br:SP 063<br>fone:(0)0<br>raio:200km<br>tipo:R</p></div>';
    
    // Cria uma nova InfoBubble com o conteúdo personalizado
    var bubble = new H.ui.InfoBubble(position, { content: content });
    
    // Abre a InfoBubble no mapa
    ui.addBubble(bubble);
  });

  circleIpojucaSafe.addEventListener('tap', function (evt) {

    var position = map.screenToGeo(evt.currentPointer.viewportX, evt.currentPointer.viewportY);
    
    
    var content = '<div><h4>Safe</h4><p>Diâmetro: 200 Km</p></div>';
    
    
    var bubble = new H.ui.InfoBubble(position, { content: content });
    
    ui.addBubble(bubble);
  });

  circleIpojuca.addEventListener('tap', function (evt) {

    var position = map.screenToGeo(evt.currentPointer.viewportX, evt.currentPointer.viewportY);
    
    
    var content = '<div><h4>AREA DE RISCO UNILEVER IPOJUCA 50KM </h4><p>cidade:IPOJUCA/PE<br>endereco:MARCO ZERO IPOJUCA<br>fone:(0)0<br>raio:50 Km<br>tipo:R</p></div>';
    
    
    var bubble = new H.ui.InfoBubble(position, { content: content });
    
    ui.addBubble(bubble);
  });


  // Função para filtrar pontos próximos a uma rota
  function filtrarPontosProximos(rota, postos, distanciaMaxima) {
    const pontosProximos = [];

    // Percorre os postos e verifica se estão próximos da rota
    postos.forEach(posto => {
      const distancia = distanciaDaRota(rota, posto);
      if (distancia <= distanciaMaxima) {
        pontosProximos.push(posto);
      }
    });

    return pontosProximos;
  }

  // Função auxiliar para converter graus em radianos
  function toRad(valor) {
    return (valor * Math.PI) / 180;
  }

  // Postos de abastecimento
  fetch("postos.json")
    .then(response => response.json())
    .then(postos => {

      //Icone do Posto de Abastecimento
      const icon = new H.map.Icon('imagens/gas.png', {
        size: {w: 32, h: 32},
        anchor: {x: 16, y: 16}
      });
      
      
      // Percorre os dados dos postos e cria um marcador para cada um
      postos.forEach(posto => {
        const marker = new H.map.Marker({
          lat: posto.lat,
          lng: posto.lng
        }, {icon:icon});
        marker.setData(posto); // Armazena os dados do posto no marcador
        map.addObject(marker);
        // função para calcular a distância entre uma mark e a rota
  function calculateDistance(mark, route) {
    // criar um objeto de serviço de rota
    var router = platform.getRoutingService();

    // criar um objeto de solicitação de matriz de distância
    var matrixRequest = {
      origins: [{ lat: mark.latitude, lng: mark.longitude }],
      destination: { lat: route.latitude, lng: route.longitude },
      mode: "fastest;truck;traffic:enabled"
    };

    // retornar uma promessa que será resolvida com a distância
    return new Promise(function(resolve, reject) {
      // calcular a matriz de distância entre a mark e a rota
      router.calculateMatrix(matrixRequest,
        function(result) {
          var matrix = result.response.matrixEntry[0];
          var distance = matrix.summary.distance;
          resolve(distance);
        },
        function(error) {
          reject(error);
        }
      );
    });
  }

      });

      // Adiciona um evento de clique nos marcadores para exibir informações
      map.addEventListener("tap", event => {
        const target = event.target;
        if (target instanceof H.map.Marker) {
          const geometry = target.getGeometry();
          const data = target.getData();
          const info = `<div><b>${data.posto}</b></div>
                        <div>${data.cidade} - ${data.estado}</div>
                        <div>${data.endereco}</div>
                        <div>${data.fone}</div>`;
          const bubble = new H.ui.InfoBubble(geometry, {
            content: info
          });
          ui.addBubble(bubble);
        } else {
          console.error('O evento não foi disparado por um marcador válido.');
        }
      });
    })
    .catch(error => console.error(error));
