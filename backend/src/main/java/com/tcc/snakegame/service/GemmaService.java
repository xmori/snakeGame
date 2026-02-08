package com.tcc.snakegame.service;

import com.tcc.snakegame.model.ChatMessage;
import com.tcc.snakegame.repository.ChatMessageRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import java.util.Map;
import java.util.HashMap;
import java.util.List;

@Service
public class GemmaService {

    private static final Logger log = LoggerFactory.getLogger(GemmaService.class);

    @Value("${spring.ai.ollama.model}")
    private String model;

    @Value("${spring.ai.ollama.base-url}")
    private String url;

    private final RestTemplate restTemplate;
    private final ChatMessageRepository chatMessageRepository;

    public GemmaService(RestTemplate restTemplate,
                        ChatMessageRepository chatMessageRepository) {
        this.restTemplate = restTemplate;
        this.chatMessageRepository = chatMessageRepository;
    }

    public String generateText(String prompt) {
        log.info("Iniciando processamento da pergunta: '{}'", prompt);

        try {
            String systemPrompt = "VocÃª Ã© um psicÃ³logo assistente virtual.  ForneÃ§a respostas empÃ¡ticas, informativas e concisas.  Seja cuidadoso ao lidar com tÃ³picos sensÃ­veis e sempre incentive o usuÃ¡rio a procurar ajuda profissional se necessÃ¡rio.";

            Map<String, Object> req = new HashMap<>();
            req.put("model", model);
            req.put("prompt", prompt);
            req.put("stream", false);
            req.put("system", systemPrompt);


            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String,Object>> requestEntity = new HttpEntity<>(req, headers);

            log.debug("Enviando requisiÃ§Ã£o para URL: {}", url + "/api/generate");
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    url + "/api/generate", requestEntity, Map.class);

            log.debug("Resposta recebida com status HTTP: {}", response.getStatusCode());

            if (response.getBody() != null && response.getBody().containsKey("response")) {
                String resposta = response.getBody().get("response").toString();
                log.info("Resposta obtida com sucesso para a pergunta: '{}'", prompt);
                chatMessageRepository.save(new ChatMessage(prompt, resposta));
                return resposta;
            }

            log.warn("Resposta obtida sem o campo 'response': {}", response.getBody());
            return "Erro ao obter resposta do snakegame.";

        } catch (HttpClientErrorException e) {
            log.error("Erro de cliente HTTP: {} - {}", e.getStatusCode(), e.getMessage());
            return "Erro ao comunicar com o modelo: " + e.getMessage();
        } catch (HttpServerErrorException e) {
            log.error("Erro do servidor Ollama: {} - {}", e.getStatusCode(), e.getMessage());
            return "ServiÃ§o do snakegame indisponÃ­vel no momento. Tente novamente mais tarde.";
        } catch (ResourceAccessException e) {
            log.error("Erro de conexÃ£o ou timeout: {}", e.getMessage());
            return "NÃ£o foi possÃ­vel conectar ao serviÃ§o do snakegame. Verifique a conexÃ£o.";
        } catch (Exception e) {
            log.error("Erro inesperado ao processar a requisiÃ§Ã£o: ", e);
            return "Erro ao obter resposta do snakegame.";
        }
    }
}
