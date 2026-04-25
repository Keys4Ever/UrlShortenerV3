-- =============================================
-- URL Shortener Database Schema - PostgreSQL
-- =============================================

-- Enum types
CREATE TYPE device_type_enum AS ENUM ('desktop', 'mobile', 'tablet', 'bot', 'unknown');

-- Tabla: users
-- Descripción: Usuarios autenticados del sistema
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nickname VARCHAR(255),
  pfp VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indices para usuarios
CREATE INDEX idx_users_email ON users(email);

-- =============================================

-- Tabla: urls
-- Descripción: URLs acortadas (pertenecen a usuarios o son anónimas)
CREATE TABLE urls (
  id SERIAL PRIMARY KEY,
  original_url TEXT NOT NULL,
  short_code VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  title VARCHAR(500),
  is_deleted BOOLEAN DEFAULT FALSE,
  user_id INTEGER,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_urls_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE CASCADE
);

-- Indices para URLs
CREATE INDEX idx_urls_short_code ON urls(short_code);
CREATE INDEX idx_urls_user_id ON urls(user_id);
CREATE INDEX idx_urls_is_deleted ON urls(is_deleted);

-- =============================================

-- Tabla: tags
-- Descripción: Etiquetas para categorizar URLs
CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indices para tags
CREATE INDEX idx_tags_name ON tags(name);

-- =============================================

-- Tabla: url_tags (Relación Many-to-Many)
-- Descripción: Asociación entre URLs y tags
CREATE TABLE url_tags (
  url_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  PRIMARY KEY (url_id, tag_id),
  
  CONSTRAINT fk_url_tags_url FOREIGN KEY (url_id) 
    REFERENCES urls(id) ON DELETE CASCADE,
  CONSTRAINT fk_url_tags_tag FOREIGN KEY (tag_id) 
    REFERENCES tags(id) ON DELETE CASCADE
);

-- =============================================

-- Tabla: url_stats
-- Descripción: Estadísticas detalladas de cada click en URLs acortadas
CREATE TABLE url_stats (
  id SERIAL PRIMARY KEY,
  url_id INTEGER NOT NULL,
  device_type device_type_enum DEFAULT 'unknown',
  country VARCHAR(2),
  ip VARCHAR(45),
  referrer TEXT,
  utm JSONB DEFAULT '{}',
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_url_stats_url FOREIGN KEY (url_id) 
    REFERENCES urls(id) ON DELETE CASCADE
);

-- Indices para url_stats (críticos para consultas)
CREATE INDEX idx_url_stats_url_id_created_at ON url_stats(url_id, created_at);
CREATE INDEX idx_url_stats_country ON url_stats(country);
CREATE INDEX idx_url_stats_device_type ON url_stats(device_type);
-- Índice GIN para búsquedas JSONB en UTM
CREATE INDEX idx_url_stats_utm_gin ON url_stats USING GIN(utm);
-- Índices específicos para claves UTM comunes
CREATE INDEX idx_url_stats_utm_source ON url_stats((utm->>'source'));
CREATE INDEX idx_url_stats_utm_medium ON url_stats((utm->>'medium'));
CREATE INDEX idx_url_stats_utm_campaign ON url_stats((utm->>'campaign'));

-- =============================================

-- Tabla: anonymous_secrets
-- Descripción: Secretos para crear URLs acortadas anónimas
CREATE TABLE anonymous_secrets (
  id SERIAL PRIMARY KEY,
  secret VARCHAR(255) UNIQUE NOT NULL,
  url_id INTEGER NOT NULL,
  is_claimed BOOLEAN DEFAULT FALSE,
  claimed_by_user_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_anonymous_secrets_url FOREIGN KEY (url_id) 
    REFERENCES urls(id) ON DELETE CASCADE,
  CONSTRAINT fk_anonymous_secrets_user FOREIGN KEY (claimed_by_user_id) 
    REFERENCES users(id) ON DELETE SET NULL
);

-- Indices para anonymous_secrets
CREATE INDEX idx_anonymous_secrets_secret ON anonymous_secrets(secret);
CREATE INDEX idx_anonymous_secrets_is_claimed ON anonymous_secrets(is_claimed);

-- =============================================
-- Vistas útiles (opcionales pero recomendadas)
-- =============================================

-- Vista: URLs activas por usuario
CREATE VIEW active_urls_by_user AS
SELECT 
  u.id as user_id,
  u.email,
  COUNT(url.id) as total_urls,
  COALESCE(SUM(us.click_count), 0) as total_clicks
FROM users u
LEFT JOIN urls url ON u.id = url.user_id AND url.is_deleted = FALSE
LEFT JOIN (
  SELECT url_id, COUNT(*) as click_count
  FROM url_stats
  GROUP BY url_id
) us ON url.id = us.url_id
GROUP BY u.id, u.email;

-- Vista: Top URLs por clicks
CREATE VIEW top_urls AS
SELECT 
  url.id,
  url.short_code,
  url.original_url,
  COALESCE(click_stats.click_count, 0) as click_count,
  u.email as created_by,
  COUNT(DISTINCT tag.id) as tag_count
FROM urls url
LEFT JOIN users u ON url.user_id = u.id
LEFT JOIN url_tags ut ON url.id = ut.url_id
LEFT JOIN tags tag ON ut.tag_id = tag.id
LEFT JOIN (
  SELECT url_id, COUNT(*) as click_count
  FROM url_stats
  GROUP BY url_id
) click_stats ON url.id = click_stats.url_id
WHERE url.is_deleted = FALSE
GROUP BY url.id, url.short_code, url.original_url, click_stats.click_count, u.email
ORDER BY click_count DESC;