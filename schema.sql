CREATE TABLE items(
    id  integer primary key,
    title varchar(255) not null,
    description varchar(500),
    link varchar(250),
    likes int,
    feedback  varchar(255),
    source text,
    createtime datetime not null default current_timestamp,
    updatetime datetime not null default current_timestamp
);

CREATE TABLE images(
    id  integer primary key,
    item_id varchar(10) not null,
    image_src varchar(500)
);
