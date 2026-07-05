package com.anime.api.storage;

import com.anime.api.model.Figure;
import com.anime.api.model.ContactMessage;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

@Service
public class FileStorage {

    private static final String DATA_DIR = "data";
    private static final String FIGURES_FILE = DATA_DIR + "/figures.json";
    private static final String MESSAGES_FILE = DATA_DIR + "/messages.json";
    private final ObjectMapper mapper = new ObjectMapper();

    @PostConstruct
    public void init() throws IOException {
        Files.createDirectories(Paths.get(DATA_DIR));
        if (!Files.exists(Paths.get(FIGURES_FILE))) {
            List<Figure> seeds = List.of(
                new Figure(1, "Goku", 34.99, "/img/goko.webp", "Dragon Ball"),
                new Figure(2, "Vegeta", 32.99, "/img/vegeta.webp", "Dragon Ball"),
                new Figure(3, "Zoro", 29.99, "/img/zoro.webp", "One Piece"),
                new Figure(4, "Luffy", 27.99, "/img/lofu.webp", "One Piece"),
                new Figure(5, "Majin Boo", 24.99, "/img/boom.webp", "Dragon Ball"),
                new Figure(6, "One Piece", 31.99, "/img/onpice1.webp", "One Piece"),
                new Figure(7, "Lofi Girl", 26.99, "/img/lofi.webp", "Original"),
                new Figure(8, "Pink Boo", 28.99, "/img/pinkbo.webp", "Dragon Ball")
            );
            mapper.writerWithDefaultPrettyPrinter().writeValue(new File(FIGURES_FILE), seeds);
        }
    }

    public List<Figure> getFigures() throws IOException {
        if (!Files.exists(Paths.get(FIGURES_FILE))) return new ArrayList<>();
        return mapper.readValue(new File(FIGURES_FILE), new TypeReference<List<Figure>>() {});
    }

    public Figure addFigure(Figure figure) throws IOException {
        List<Figure> figures = getFigures();
        long newId = figures.stream().mapToLong(Figure::getId).max().orElse(0) + 1;
        figure.setId(newId);
        figures.add(figure);
        mapper.writerWithDefaultPrettyPrinter().writeValue(new File(FIGURES_FILE), figures);
        return figure;
    }

    public void saveMessage(ContactMessage msg) throws IOException {
        List<ContactMessage> messages = new ArrayList<>();
        if (Files.exists(Paths.get(MESSAGES_FILE))) {
            messages = mapper.readValue(new File(MESSAGES_FILE), new TypeReference<List<ContactMessage>>() {});
        }
        long newId = messages.stream().mapToLong(ContactMessage::getId).max().orElse(0) + 1;
        msg.setId(newId);
        messages.add(msg);
        mapper.writerWithDefaultPrettyPrinter().writeValue(new File(MESSAGES_FILE), messages);
    }
}
