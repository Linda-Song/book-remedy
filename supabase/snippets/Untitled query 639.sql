select unnest(genres) as genre, count(*)
from books
group by 1
order by 2 desc;
